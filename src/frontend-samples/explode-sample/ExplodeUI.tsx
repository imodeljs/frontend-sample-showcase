/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export default class ExplodeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, {}> {

  public getControls(): React.ReactChild {
    return <></>;
  }

  public readonly onIModelReady = (_iModel: IModelConnection): void => {

  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Explode Sample" iModelSelector={this.props.iModelSelector} controls={this.getControls()}/>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}/>
      </>
    );
  }
}
