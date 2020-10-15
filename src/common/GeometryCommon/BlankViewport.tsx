/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnection, DisplayStyle3dState, FitViewTool, IModelApp, IModelConnection, PanViewTool, RotateViewTool, SelectionTool, SpatialViewState, StandardViewId, ViewState, ZoomViewTool, Environment, DisplayStyleState, Viewport, ScreenViewport } from "@bentley/imodeljs-frontend";
import { Cartographic, ColorDef, RenderMode, LightSettings, ViewFlagProps, DisplayStyle3dSettingsProps, DisplayStyle3dSettings } from "@bentley/imodeljs-common";
import { ViewportComponent } from "@bentley/ui-components";
import { GeometryDecorator } from "./GeometryDecorator";
import "Components/Viewport/Toolbar.scss";

const renderingStyleViewFlags: ViewFlagProps = {
  noConstruct: true,
  noCameraLights: false,
  noSourceLights: false,
  noSolarLight: false,
  visEdges: false,
  hidEdges: false,
  shadows: false,
  monochrome: false,
  ambientOcclusion: false,
  thematicDisplay: false,
  renderMode: RenderMode.SmoothShade,
};

export class BlankViewport extends React.Component<{ force2d: boolean }, { vp: Viewport }> {

  public static decorator: GeometryDecorator;
  public static imodel: IModelConnection;
  public static viewState: ViewState;

  // Creates a blank iModelConnection with the specified dimensions
  private static getBlankConnection(sampleDimensions: Range3d) {
    const exton: BlankConnection = BlankConnection.create({
      name: "GeometryConnection",
      location: Cartographic.fromDegrees(0, 0, 0),
      extents: sampleDimensions,
    });
    return exton;
  }

  // Generates a simple viewState with a plain white background to be used in conjunction with the blank iModelConnection
  // TODO: Modify background color to be more appealing
  // TODO: Enable a style of lighting that makes 3d objects more obviously 3d
  public static async getViewState(imodel: IModelConnection): Promise<ViewState> {
    const ext = imodel.projectExtents;
    const viewState = SpatialViewState.createBlank(imodel, ext.low, ext.high.minus(ext.low));
    viewState.setAllow3dManipulations(true);
    viewState.setStandardRotation(StandardViewId.Top);
    return viewState;
  }

  // Initializes the iModel and ViewState for the Blank Viewport
  public static async setup(sampleDimensions: Range3d = new Range3d(-10, -10, -10, 1010, 1010, 1010)) {
    select();
    const imodel = BlankViewport.getBlankConnection(sampleDimensions);
    const viewState = await BlankViewport.getViewState(imodel);
    BlankViewport.imodel = imodel;
    BlankViewport.viewState = viewState;
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      const style2: DisplayStyle3dSettingsProps = {
        environment: {
          sky: {
            display: true,
            nadirColor: ColorDef.computeTbgrFromComponents(64, 74, 66),
          },
        },
        backgroundColor: 10921638,
        viewflags: { ...renderingStyleViewFlags, noSolarLight: false, visEdges: true },
        lights: {
          solar: { direction: [-0.9833878378071199, -0.18098510351728977, 0.013883542698953828] },
        },
        hline: {
          visible: { ovrColor: true, color: 0, pattern: 0, width: 1 },
          hidden: { ovrColor: false, color: 16777215, pattern: 3435973836, width: 0 },
          transThreshold: 1,
        },
      };
      viewport.overrideDisplayStyle(style2);
    });
  }

  public render() {
    return (
      <>
        {toolbar(this.props.force2d)}
        {BlankViewport.imodel && BlankViewport.viewState ? <ViewportComponent imodel={BlankViewport.imodel} viewState={BlankViewport.viewState}></ViewportComponent> : undefined}
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
