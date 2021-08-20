/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d, Vector3d } from "@bentley/geometry-core";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { CurveFractionWidgetProvider } from "./CurveFractionWidget";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";

const uiProviders = [new CurveFractionWidgetProvider()];

const connection: BlankConnectionProps = {
  name: "GeometryConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(-35, -35, -35, 35, 35, 35),
};
const viewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: false,
  lookAt: {
    eyePoint: { x: 0, y: 0, z: 25 },
    targetPoint: { x: 0, y: 0, z: 0 },
    upVector: new Vector3d(0, 0, 1),
  },
};

const CurveFractionApp: FunctionComponent = () => {
  useSampleWidget("Use the slider below or click on one of the green points to adjust the fraction and see how the points move along each path.", []);

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      <BlankViewer
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        theme={"dark"}
        defaultUiConfig={default3DSandboxUi}
        viewStateOptions={viewState}
        blankConnection={connection}
        uiProviders={uiProviders}
      />
    </>
  );
};

export default CurveFractionApp;
