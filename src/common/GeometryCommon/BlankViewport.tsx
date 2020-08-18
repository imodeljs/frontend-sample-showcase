/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnection, DisplayStyle3dState, FitViewTool, IModelApp, IModelConnection, PanViewTool, RotateViewTool, SelectionTool, SpatialViewState, StandardViewId, ViewState, ZoomViewTool } from "@bentley/imodeljs-frontend";
import { Cartographic, ColorDef } from "@bentley/imodeljs-common";
import { ViewportComponent } from "@bentley/ui-components";
import { GeometryDecorator } from "./GeometryDecorator";
import "Components/Viewport/Toolbar.scss";

export class BlankViewport extends React.Component<{ force2d: boolean }, { imodel: IModelConnection, viewState: ViewState }> {

  public static decorator: GeometryDecorator;

  // create a new blank connection centered on Exton PA
  private getBlankConnection() {
    const exton: BlankConnection = BlankConnection.create({
      // call this connection "Exton PA"
      name: "Exton PA",
      // put the center of the connection near Exton, Pennsylvania (Bentley's HQ)
      location: Cartographic.fromDegrees(-75.686694, 40.065757, 0),
      // create the area-of-interest to be 2000 x 2000 x 200 meters, centered around 0,0.0
      extents: new Range3d(-1000, -1000, -1000, 1000, 1000, 1000),
    });
    return exton;
  }

  /** This callback will be executed by ReloadableViewport to initialize the viewstate */
  public static async getViewState(imodel: IModelConnection): Promise<ViewState> {
    const ext = imodel.projectExtents;

    // start with a new "blank" spatial view to show the extents of the project, from top view
    const viewState = SpatialViewState.createBlank(imodel, ext.low, ext.high.minus(ext.low));
    viewState.setAllow3dManipulations(true);
    viewState.setStandardRotation(StandardViewId.Top);
    const style = viewState.displayStyle as DisplayStyle3dState;

    style.backgroundColor = ColorDef.white;

    return viewState;
  }

  /** Toolbar containing simple navigation tools */
  public toolbar = () => {
    /* eslint-disable */
    return (
      <div className="toolbar">
        <a href="#" title={SelectionTool.flyover} onClick={(e) => { e.preventDefault(); select(); }}><span className="icon icon-cursor"></span></a>
        <a href="#" title={FitViewTool.flyover} onClick={(e) => { e.preventDefault(); fitView(); }}><span className="icon icon-fit-to-view"></span></a>
        {this.props.force2d ? undefined : <a href="#" title={RotateViewTool.flyover} onClick={(e) => { e.preventDefault(); rotate(); }}><span className="icon icon-gyroscope"></span></a>}
        <a href="#" title={PanViewTool.flyover} onClick={(e) => { e.preventDefault(); pan(); }}><span className="icon icon-hand-2"></span></a>
        <a href="#" title={ZoomViewTool.flyover} onClick={(e) => { e.preventDefault(); zoom(); }}><span className="icon icon-zoom"></span></a>
      </div>
    );
    /* eslint-enable */
  }

  public render() {
    return (
      <>
        {this.toolbar()}
        {this.state && this.state.imodel && this.state.viewState ? <ViewportComponent imodel={this.state.imodel} viewState={this.state.viewState}></ViewportComponent> : undefined}
      </>
    );
  }

  public async componentDidMount() {
    const imodel = this.getBlankConnection();
    const viewState = await BlankViewport.getViewState(imodel);
    this.setState({ imodel, viewState });
  }

}

const select = () => {
  IModelApp.tools.run(SelectionTool.toolId);
};

const fitView = () => {
  IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
};

const rotate = () => {
  IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView);
};

const pan = () => {
  IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView);
};

const zoom = () => {
  IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView);
};
