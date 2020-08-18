/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";

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
