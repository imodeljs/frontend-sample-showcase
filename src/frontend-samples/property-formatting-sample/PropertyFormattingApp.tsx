/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { DEFAULT_PROPERTY_GRID_RULESET } from "@bentley/presentation-components/lib/presentation-components/propertygrid/DataProvider"; // tslint:disable-line: no-direct-imports
import { KeySet, Field } from "@bentley/presentation-common";
import SampleApp from "common/SampleApp";
import { PropertyFormattingUI } from "./PropertyFormattingUI";

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
  public static async setup(iModelName: string) {
    PropertyFormattingApp.addSelectionListener();
    return <PropertyFormattingUI iModelName={iModelName} />;
  }

  public static teardown() {
    PropertyFormattingApp.removeSelectionListener();
  }

  public static async addSelectionListener() {
    Presentation.selection.selectionChange.addListener(PropertyFormattingApp._onSelectionChanged);
  }

  public static async removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(PropertyFormattingApp._onSelectionChanged);
  }

  private static _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    const requestOptions = { imodel: evt.imodel, rulesetOrId: DEFAULT_PROPERTY_GRID_RULESET };
    const descriptor = await Presentation.presentation.getContentDescriptor(requestOptions, "Grid", keys, undefined);

    if (undefined === descriptor)
      return;

    const content = await Presentation.presentation.getContent(requestOptions, descriptor, keys);

    if (undefined === content)
      return;

    console.log(content);

    const item = content.contentSet[0];
    const stuff: any[] = [];
    descriptor.fields.forEach((f: Field) => {
      const fieldName = f.name;
      const catName = f.category.label;
      const displayValue = item.displayValues[fieldName];

      stuff.push({ fieldName, catName, displayValue });
    });

    console.log(stuff);
  }

  public static async formatProperties(elementIds: string[], imodel: IModelConnection) {
  }
}
