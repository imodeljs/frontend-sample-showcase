/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Point3d, Range3d, Vector3d } from "@bentley/geometry-core";
import { BlankConnection, BlankConnectionProps, FitViewTool, IModelApp, IModelConnection, PanViewTool, RotateViewTool, SelectionTool, SpatialViewState, StandardViewId, ViewState, ZoomViewTool } from "@bentley/imodeljs-frontend";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";
import { ViewportComponent } from "@bentley/ui-components";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionViewState, BlankConnectionViewStateLookAt } from "@bentley/itwin-viewer-react";

import "common/SandboxViewport/Toolbar/Toolbar.scss";

interface BlankViewportProps {
  force2d: boolean;
  grid: boolean;
  sampleSpace: Range3d | undefined;
}

export class BlankViewport extends React.Component<BlankViewportProps, { imodel: IModelConnection | undefined, viewState: ViewState | undefined }> {

  public decorator: GeometryDecorator | undefined;

  public async componentWillUnmount() {
    if (this.state.imodel) {
      await this.state.imodel.close();
    }
  }

  // Creates a blank iModelConnection with the specified dimensions
  public static getBlankConnection(sampleDimensions: Range3d) {
    const exton: BlankConnectionProps = {
      name: "GeometryConnection",
      location: Cartographic.fromDegrees(0, 0, 0),
      extents: sampleDimensions,
    };
    return exton;
  }

  // Generates a simple viewState with a plain white background to be used in conjunction with the blank iModelConnection
  public static getViewState(grid: boolean, twoDim: boolean): BlankConnectionViewState {
    const viewState: BlankConnectionViewState = {
      displayStyle: { backgroundColor: ColorDef.white },
      viewFlags: { grid, renderMode: RenderMode.SmoothShade },
      setAllow3dManipulations: !twoDim,
      lookAt: twoDim ? {
        eyePoint: { x: 0, y: 0, z: 25 },
        targetPoint: { x: 0, y: 0, z: 0 },
        upVector: new Vector3d(0, 0, 1),
      } : undefined,
    };

    return viewState;
  }

}