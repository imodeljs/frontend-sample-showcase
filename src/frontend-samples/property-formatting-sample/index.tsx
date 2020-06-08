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

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "zoom-to-elements-thumbnail.png",
    setup: async (iModelName: string) => {
      return <PropertyFormattingUI iModelName={iModelName} />;
    },
  });
}

class PropertyFormattingAPI {
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
  elementsAreSelected: boolean;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      elementsAreSelected: false,
    };

    // subscribe for unified selection changes
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    this.setState({ elementsAreSelected: !selection.isEmpty });
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
