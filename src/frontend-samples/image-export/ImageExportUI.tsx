/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Button, ButtonType } from "@bentley/ui-core";
import ImageExportApp from "./ImageExportApp";

export default class ImageExportyUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, {}> {

  constructor(props: any) {
    super(props);
    this.exportImageHandler = this.exportImageHandler.bind(this);
  }

  private exportImageHandler() {
    ImageExportApp.exportImage();
  }

  public getControls() {
    return (
      <div>
        <Button buttonType={ButtonType.Hollow} onClick={ImageExportApp.exportImage.bind(ImageExportApp)}>Save as png</Button>
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Export current viewport as image" controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} />
      </>
    );
  }
}
