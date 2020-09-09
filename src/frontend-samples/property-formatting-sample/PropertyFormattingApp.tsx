/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs, SelectionChangesListener } from "@bentley/presentation-frontend";
import { DEFAULT_PROPERTY_GRID_RULESET } from "@bentley/presentation-components/lib/presentation-components/propertygrid/DataProvider"; // tslint:disable-line: no-direct-imports
import { Content, KeySet, Field, DisplayValue } from "@bentley/presentation-common";
import SampleApp from "common/SampleApp";
import { PropertyFormattingUI } from "./PropertyFormattingUI";
import { OverlySimpleProperyRecord } from "./SimplifiedUI";
import { PropertyRecord } from "@bentley/ui-abstract";
import { ContentBuilder } from "@bentley/presentation-components";

/*
These are instructions on how to use the PresentationManager API to essentially duplicate the property display
from DesignReview.  Doing this yourself gives you lots of flexibility to customize the display and to use your
own UI controls.

There are three major steps. First is to compute the set of related elements from which to source the
properties, second is to extract the properties, and third is to get something presentable to the user
(includes formatting, grouping, etc.) In all, it’s a pretty big job once you consider all the complexity
surrounding all the different types of primitive properties, array properties, and nested structures, not
to mention grouping, sorting, and filtering.
1.	Use PresentationManager.getSelectionScopes to get a list of available scopes. Pick a scope and pass
    it to PresentationManager.computeSelection along with a list of elementIds. This will give you a KeySet.
2.	Pass the keyset to PresentationManager.getContent. You will need to supply a ruleset. For properties,
    usually this ruleset is what you want.
3.	Using logic like this, build a set of PropertyRecords that are appropriate to display to the user.

For step 2, you will need a content descriptor, which you can get by calling PresentationManager.getContentDescriptor.
For that method, the tricky argument is ‘Display Type’ for which I suggest you start with DefaultContentDisplayTypes.PropertyPane.

At each of these steps there are lots of options to control the process.  Also, all the backend methods require
you to supply a ClientRequestContext. You should have one of these that you used to call IModelDb.open.

*/

export class PropertyFormattingApp implements SampleApp {
  private static selectionListener: SelectionChangesListener;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <PropertyFormattingUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    PropertyFormattingApp.removeSelectionListener();
  }

  public static async addSelectionListener(listener: SelectionChangesListener) {
    this.selectionListener = listener;
    Presentation.selection.selectionChange.addListener(this.selectionListener);
  }

  public static async removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(this.selectionListener);
  }

  public static async getFormattedProperties(evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider): Promise<Content | undefined> {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    const requestOptions = { imodel: evt.imodel, rulesetOrId: DEFAULT_PROPERTY_GRID_RULESET };
    const descriptor = await Presentation.presentation.getContentDescriptor(requestOptions, "Grid", keys, undefined);

    if (undefined === descriptor)
      return;

    return Presentation.presentation.getContent(requestOptions, descriptor, keys);
  }

  public static createOverlySimplePropertyRecords(content: Content, propertyNameFilter: string[] = []) {
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
        data.push({ name: fieldName, displayLabel: fieldLabel, displayValue: "[" + displayValue.length + "] " + f.type.typeName });
      } else if (DisplayValue.isMap(displayValue)) {
        data.push({ name: fieldName, displayLabel: fieldLabel, displayValue: f.type.typeName });
      }
    });

    return data;
  }

  public static createPropertyRecordsUsingContentBuilder(content: Content, categoryNameFilter: string = "") {

    const item = content.contentSet[0];
    const data: PropertyRecord[] = [];
    let fields = content.descriptor.fields;

    if (categoryNameFilter)
      fields = content.descriptor.fields.filter((f: Field) => f.category.name === categoryNameFilter);

    fields.forEach((f: Field) => {
      data.push(ContentBuilder.createPropertyRecord(f, item));
    });

    return data;
  }
}
