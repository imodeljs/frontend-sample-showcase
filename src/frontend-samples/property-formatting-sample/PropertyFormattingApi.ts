/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { Presentation, SelectionChangesListener } from "@bentley/presentation-frontend";
import { Content, DisplayValue, Field, KeySet } from "@bentley/presentation-common";
import { OverlySimplePropertyRecord } from "./approach-3-App";
import { PropertyRecord } from "@bentley/ui-abstract";
import { DEFAULT_PROPERTY_GRID_RULESET, PresentationPropertyDataProvider, PresentationTableDataProvider } from "@bentley/presentation-components";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export interface PropertyProps {
  keys: KeySet;
  imodel?: IModelConnection;
}

/* This class demonstrates the key APIs needed to access formatted property information
   suitable to present to end users. */
export class PropertyFormattingApi {
  private static selectionListener: SelectionChangesListener;

  public static addSelectionListener(listener: SelectionChangesListener) {
    this.selectionListener = listener;
    Presentation.selection.selectionChange.addListener(this.selectionListener);
  }

  public static removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(this.selectionListener);
  }

  /* Approach 1: Using PresentationPropertyDataProvider

  This approach uses the PresentationPropertyDataProvider to fully handle all the work of querying the content,
  and processing it to create the PropertyRecords.  Finally, this data provider is compatible with the PropertyGrid
  UI component which fully handles grouping and sorting properties, and a better presentation of arrays and structs. */
  public static createPropertyDataProvider(keys: KeySet, imodel: IModelConnection, customized: boolean) {
    let dataProvider;

    if (!customized)
      // Use the default property records
      dataProvider = new PresentationPropertyDataProvider({ imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });
    else
      // (optional) Customize the property records
      dataProvider = new PropertyFormattingApi.MyCustomPropertyProvider({ imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });

    dataProvider.keys = keys;
    return dataProvider;
  }

  /* This data provider (declared here as a nested class) demonstrates how to customize the properties which
     are displayed by the property grid.  By overriding the getData method, it is possible to add, modify,
     or delete from the list of property records returned from the default provider logic. */
  private static MyCustomPropertyProvider = class extends PresentationPropertyDataProvider {
    public async getData() {
      const data = await super.getData();

      // Add a custom category
      const customCategoryName = "/custom-category-name/";
      data.categories.unshift({ name: customCategoryName, label: "Custom Category", expand: true });

      const customRecords = [
        PropertyRecord.fromString("Value 1", "Property 1"),
        PropertyRecord.fromString("Value 2", "Property 2"),
        PropertyRecord.fromString("Value 3", "Property 3"),
      ];

      data.records[customCategoryName] = customRecords;

      return data;
    }
  };

  /* Approach 2: Using PresentationTableDataProvider

  This approach uses the PresentationTableDataProvider to fully handle all the work of querying the content,
  and processing it to create the PropertyRecords.  Finally, this data provider is compatible with the Table
  UI component which can show results for many elements without merging them together. */
  public static createTableDataProvider(keys: KeySet, imodel: IModelConnection) {
    const dataProvider = new PresentationTableDataProvider({ imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });
    dataProvider.keys = keys;
    return dataProvider;
  }

  /* Approach 3: Do it all yourself.  If you want to use your own UI components.

  This approach shows how to process the Content object yourself.  This is an oversimplified implementation that
  does not handle the difficult cases like properties which are arrays or structs.  Instead it represents
  every property value as a single string.

  A full implementation would handle arrays and structs.  Also, a full implementation would consider all the items
  within the contentSet, not just the first one.  For an example of a full implementation see ContentBuilder.createPropertyRecord:
  https://github.com/imodeljs/imodeljs/blob/master/presentation/components/src/presentation-components/common/ContentBuilder.ts

  The end result of this method is a list of name, label, value for each property. */
  public static async createOverlySimplePropertyRecords(keys: KeySet, imodel: IModelConnection, propertyNameFilter: string[] = []) {
    const content = await this.queryForContent(keys, imodel);

    if (!content)
      return [];

    const item = content.contentSet[0];
    const data: OverlySimplePropertyRecord[] = [];
    let fields = content.descriptor.fields;

    if (0 !== propertyNameFilter.length) {
      fields = fields.filter((f: Field) => propertyNameFilter.includes(f.name));
    }

    fields.forEach((f: Field) => {
      const fieldName = f.name;                           // Unique name for this field
      const fieldLabel = f.label;                         // User facing label for this field
      const displayValue = item.displayValues[f.name];    // Value to display to user

      if (DisplayValue.isPrimitive(displayValue)) {
        const displayValueString = (undefined !== displayValue) ? displayValue.toString() : "";
        data.push({ name: fieldName, displayLabel: fieldLabel, displayValue: displayValueString });
      } else if (DisplayValue.isArray(displayValue)) {
        data.push({ name: fieldName, displayLabel: fieldLabel, displayValue: `[${displayValue.length}] ${f.type.typeName}` });
      } else if (DisplayValue.isMap(displayValue)) {
        data.push({ name: fieldName, displayLabel: fieldLabel, displayValue: f.type.typeName });
      }
    });

    return data;
  }

  /* This method uses the Presentation API to query for the Content of the selected elements.  The Content object contains
     everything needed to show the property information in a user interface.  This includes the property names, types, and
     values formatted as strings.

     This method is used only by approach three.  The other approaches make the same query internally. */
  public static async queryForContent(keys: KeySet, imodel: IModelConnection): Promise<Content | undefined> {
    const options = { imodel, keys, rulesetOrId: DEFAULT_PROPERTY_GRID_RULESET };
    const descriptor = await Presentation.presentation.getContentDescriptor({ ...options, displayType: "Grid" });
    if (undefined === descriptor)
      return;

    return Presentation.presentation.getContent({ ...options, descriptor });
  }

}

