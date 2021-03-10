/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Point3d, Range3d, Vector3d } from "@bentley/geometry-core";
import { BlankConnection, FitViewTool, IModelApp, IModelConnection, PanViewTool, RotateViewTool, SelectionTool, SpatialViewState, StandardViewId, ViewState, ZoomViewTool } from "@bentley/imodeljs-frontend";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";
import { ViewportComponent } from "@bentley/ui-components";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import "common/SandboxViewport/Toolbar/Toolbar.scss";

interface BlankViewportProps {
  force2d: boolean;
  grid: boolean;
  sampleSpace: Range3d | undefined;
}

export class BlankViewport extends React.Component<BlankViewportProps, { imodel: IModelConnection | undefined, viewState: ViewState | undefined }> {

  public decorator: GeometryDecorator | undefined;

  public componentDidMount() {
    let imodel;
    if (this.props.sampleSpace) {
      imodel = BlankViewport.getBlankConnection(this.props.sampleSpace);
    } else {
      imodel = BlankViewport.getBlankConnection(new Range3d(-30, -30, -30, 30, 30, 30));
    }
    const viewState = BlankViewport.getViewState(imodel, this.props.grid, this.props.force2d);
    this.setState({
      viewState,
      imodel,
    });
  }

  public async componentWillUnmount() {
    if (this.state.imodel) {
      await this.state.imodel.close();
    }
  }

  // Creates a blank iModelConnection with the specified dimensions
  public static getBlankConnection(sampleDimensions: Range3d) {
    const exton: BlankConnection = BlankConnection.create({
      name: "GeometryConnection",
      location: Cartographic.fromDegrees(0, 0, 0),
      extents: sampleDimensions,
    });
    return exton;
  }

  // Generates a simple viewState with a plain white background to be used in conjunction with the blank iModelConnection
  public static getViewState(imodel: IModelConnection, grid: boolean, twoDim: boolean): SpatialViewState {
    const ext = imodel.projectExtents;
    const viewState = SpatialViewState.createBlank(imodel, ext.low, ext.high.minus(ext.low));
    if (!twoDim) {
      viewState.setAllow3dManipulations(true);
      viewState.lookAt(new Point3d(15, 15, 15), new Point3d(0, 0, 0), new Vector3d(0, 0, 1));
    } else {
      viewState.setAllow3dManipulations(false);
      viewState.setStandardRotation(StandardViewId.Top);
    }
    const flags = viewState.viewFlags.clone()
    flags.grid = true;
    flags.renderMode = RenderMode.SmoothShade
    viewState.displayStyle.viewFlags = flags;
    viewState.displayStyle.backgroundColor = ColorDef.white;
    if (grid)
      viewState.viewFlags.grid = true;
    else
      viewState.viewFlags.grid = false;
    return viewState;
  }

  public render() {
    return (
      <>
        {this.state && this.state.imodel && this.state.viewState ? toolbar(this.props.force2d) : undefined}
        {this.state && this.state.imodel && this.state.viewState ? <ViewportComponent imodel={this.state.imodel} viewState={this.state.viewState}></ViewportComponent> : undefined}
      </>
    );
  }

}

// The toolbar that is used the various geometry samples
// The rotate tool is available depending on whether the viewport is 2d or 3d
const toolbar = (allowRotate: boolean) => {
  /* eslint-disable */
  return (
    <div className="toolbar">
      <a href="#" title={SelectionTool.flyover} onClick={(e) => { e.preventDefault(); select(); }}><span className="icon icon-cursor"></span></a>
      <a href="#" title={FitViewTool.flyover} onClick={(e) => { e.preventDefault(); fitView(); }}><span className="icon icon-fit-to-view"></span></a>
      {allowRotate ? undefined : <a href="#" title={RotateViewTool.flyover} onClick={(e) => { e.preventDefault(); rotate(); }}><span className="icon icon-gyroscope"></span></a>}
      <a href="#" title={PanViewTool.flyover} onClick={(e) => { e.preventDefault(); pan(); }}><span className="icon icon-hand-2"></span></a>
      <a href="#" title={ZoomViewTool.flyover} onClick={(e) => { e.preventDefault(); zoom(); }}><span className="icon icon-zoom"></span></a>
    </div>
  );
  /* eslint-enable */
};

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
