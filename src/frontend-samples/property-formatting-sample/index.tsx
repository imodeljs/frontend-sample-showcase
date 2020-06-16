/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { DEFAULT_PROPERTY_GRID_RULESET } from "@bentley/presentation-components/lib/presentation-components/propertygrid/DataProvider";
import { KeySet, Field } from "@bentley/presentation-common";

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "zoom-to-elements-thumbnail.png",
    setup: async (iModelName: string) => {
      PropertyFormattingAPI.addSelectionListener();
      return <PropertyFormattingUI iModelName={iModelName} />;
    },
    teardown: async () => {
      PropertyFormattingAPI.removeSelectionListener();
    }
  });
}

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

class PropertyFormattingAPI {
  public static async addSelectionListener() {
    Presentation.selection.selectionChange.addListener(PropertyFormattingAPI._onSelectionChanged);
  }

  public static async removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(PropertyFormattingAPI._onSelectionChanged);
  }

  private static _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    const requestContext = { imodel: evt.imodel, rulesetOrId: DEFAULT_PROPERTY_GRID_RULESET };
    const descriptor = await Presentation.presentation.getContentDescriptor(requestContext, "Grid", keys, undefined);

    if (undefined === descriptor)
      return;

    const content = await Presentation.presentation.getContent(requestContext, descriptor, keys);

    if (undefined === content)
      return;

    /*
    descriptor.fields.forEach((f: Field) => {
      content.contentSet.find()
    });
    */
    console.log(content);
  }

  public static async formatProperties(elementIds: string[], imodel: IModelConnection) {
  }
}

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Instructions for property formatting sample.</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/zoom-to-elements-sample" />
          </div>
          <hr></hr>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
        {this.getControlPane()}
      </>
    );
  }
}
