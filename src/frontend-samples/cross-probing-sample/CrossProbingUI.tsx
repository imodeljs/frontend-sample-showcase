/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { IModelConnection, ViewCreator2d, ViewState } from "@bentley/imodeljs-frontend";
import { ViewportAndNavigation } from "common/SandboxViewport/ViewportAndNavigation";
import { ColorDef } from "@bentley/imodeljs-common";
import CrossProbingApp from "./CrossProbingApp";

interface CrossProbingUIState {
  imodel?: IModelConnection;
  viewState2d?: ViewState;
}

export default class CrossProbingUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, CrossProbingUIState> {

  public state: CrossProbingUIState = {};

  // When iModel is ready, initialize element selection listener and assign initial 2D view.
  private _onIModelReady = async (imodel: IModelConnection) => {
    CrossProbingApp.addElementSelectionListener(imodel);
    await CrossProbingApp.loadElementMap(imodel);
    const viewState2d = await this.getFirst2DView(imodel);
    this.setState({ imodel, viewState2d });
  }

  // Get first 2D view in iModel.
  private async getFirst2DView(imodel: IModelConnection): Promise<ViewState> {
    const viewCreator = new ViewCreator2d(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    let viewState2d;
    if (models.length === 0)
      throw new Error("No 2D models found in iModel.");

    return viewCreator.createViewForModel(models[0].id!, models[0].classFullName, { bgColor: ColorDef.black });
  }

  /** The sample's render method */
  public render() {

    let drawingViewport;
    if (this.state.imodel && this.state.viewState2d)
      drawingViewport = (<div style={{ width: "100%", height: "50%", float: "right" }}>
        <ViewportAndNavigation imodel={this.state.imodel} viewState={this.state.viewState2d} />
      </div>);

    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Click on an element in either of the views to zoom to corresponding element in the other view." iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the 3D model */}
        <div style={{ width: "100%", height: "50%", float: "left" }}>
          <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
        { /* Second viewport to display the 2D Model */}
        {drawingViewport}
      </>
    );
  }
}
