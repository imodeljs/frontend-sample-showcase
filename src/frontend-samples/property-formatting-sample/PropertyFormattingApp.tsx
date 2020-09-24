/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { Presentation, SelectionChangesListener } from "@bentley/presentation-frontend";
import { DEFAULT_PROPERTY_GRID_RULESET, PresentationPropertyDataProvider } from "@bentley/presentation-components/lib/presentation-components/propertygrid/DataProvider"; // tslint:disable-line: no-direct-imports
import { CategoryDescription, Content, DisplayValue, Field, KeySet } from "@bentley/presentation-common";
import SampleApp from "common/SampleApp";
import { PropertyFormattingUI } from "./PropertyFormattingUI";
import { OverlySimpleProperyRecord } from "./approach-3-UI";
import { PropertyRecord } from "@bentley/ui-abstract";
import { ContentBuilder } from "@bentley/presentation-components";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export interface PropertyProps {
  keys: KeySet;
  imodel?: IModelConnection;
}

/*
   This sample illustrates three approaches for showing element properties.  Which approach
   to choose depends on what if any customization you need for your use case.

   Approach 1: The easiest way.  If you want to show the properties in the default way.
   Approach 2: Use your own UI components.  If you are not using the @bentley/ui-components package.
   Approach 3: Do it all yourself.  If you want to customize which properties to show and/or use your own ui components. */

/* This class demonstrates the key APIs needed to access formatted property information
   suitable to present to end users.

   In summary, the process can be broken down to three steps:
   1. Query the backend for the information on a set of elements.  This is called Content.
   2. Process the Content and create a set of PropertyRecords suitable for the user interface.
   3. Use the PropertyRecords to populate a UI component. */
export class PropertyFormattingApp implements SampleApp {
  private static selectionListener: SelectionChangesListener;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <PropertyFormattingUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    PropertyFormattingApp.removeSelectionListener();
  }

  public static addSelectionListener(listener: SelectionChangesListener) {
    this.selectionListener = listener;
    Presentation.selection.selectionChange.addListener(this.selectionListener);
  }

  public static removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(this.selectionListener);
  }

  /* This method uses the Presentation API to query for the Content of the selected elements.  The Content object contains
     everything needed to show the property information in a user interface.  This includes the property names, types, and
     values formatted as strings.

     This method is used by approaches two and three below.  The first approach makes the same query internally. */
  public static async queryForContent(keys: KeySet, imodel: IModelConnection): Promise<Content | undefined> {
    const options = { imodel, keys, rulesetOrId: DEFAULT_PROPERTY_GRID_RULESET };
    const descriptor = await Presentation.presentation.getContentDescriptor({ ...options, displayType: "Grid" });
    if (undefined === descriptor)
      return;

    return Presentation.presentation.getContent({ ...options, descriptor });
  }

  /* Approach 1: Using PresentationPropertyDataProvider

  This approach uses the PresentationPropertyDataProvider to fully handle all the work of querying the content,
  and processing it to create the PropertyRecords.  Finally, this data provider is compatible with the PropertyGrid
  UI component which fully handles grouping and sorting properties, and a better presentation of arrays and structs. */
  public static createPresentationDataProvider(keys: KeySet, imodel: IModelConnection) {
    const dataProvider = new PresentationPropertyDataProvider({ imodel, ruleset: DEFAULT_PROPERTY_GRID_RULESET });
    dataProvider.keys = keys;
    return dataProvider;
  }

  /* Approach 2: Using ContentBuilder

  This approach uses the ContentBuilder API to handle the task of processing the Content object and
  creating a set of PropertyRecords for all the properties.  It correctly handles properties which are
  arrays and structs.

  A full implementation would consider all the items within the contentSet, not just the first one. */
  public static createPropertyRecordsUsingContentBuilder(content: Content) {
    const item = content.contentSet[0];
    const fields = content.descriptor.fields;
    const records = new Map<CategoryDescription, PropertyRecord[]>();

    fields.forEach((f: Field) => {
      const propertyRecord = ContentBuilder.createPropertyRecord(f, item);

      if (records.has(f.category))
        records.get(f.category)?.push(propertyRecord);
      else
        records.set(f.category, [propertyRecord]);
    });

    return records;
  }

  /* Approach 3: Do it all yourself.  If you want to customize which properties to show.

  This approach shows how to process the Content object yourself.  This is an oversimplified implementation that
  does not handle the difficult cases like properties which are arrays or structs.  Instead it represents
  every property value as a single string.

  A full implementation would handle arrays and structs.  Also, a full implementation would consider all the items
  within the contentSet, not just the first one.

  The end result of this method is a list of name, label, value for each property. */
  public static async createOverlySimplePropertyRecords(keys: KeySet, imodel: IModelConnection, propertyNameFilter: string[] = []) {
    const content = await this.queryForContent(keys, imodel);

    if (!content)
      return [];

    const item = content.contentSet[0];
    const data: OverlySimpleProperyRecord[] = [];
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
}
