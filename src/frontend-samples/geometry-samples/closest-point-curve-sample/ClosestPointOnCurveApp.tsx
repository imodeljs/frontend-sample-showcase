/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@itwin/core-geometry";
import { BlankConnectionProps, IModelApp, ScreenViewport, StandardViewId } from "@itwin/core-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { ClosestPointOnCurveWidgetProvider } from "./ClosestPointOnCurveWidget";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";

const uiProviders = [new ClosestPointOnCurveWidgetProvider()];

const connection: BlankConnectionProps = {
  name: "GeometryConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(-30, -30, -30, 30, 30, 30),
};
const viewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: false,
};

const setupView = (vp: ScreenViewport) => {
  if (vp && vp.view.is3d()) {
    vp.setStandardRotation(StandardViewId.Top);
    vp.synchWithView();
  }
};

const ClosestPointOnCurveApp: FunctionComponent = () => {
  useSampleWidget("Click on the green space point to move it. The program will calculate the closest point on the curve.", []);

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      <BlankViewer
        authConfig={{ getAccessToken: AuthorizationClient.oidcClient.getAccessToken, onAccessTokenChanged: AuthorizationClient.oidcClient.onAccessTokenChanged }}
        theme={"dark"}
        defaultUiConfig={default3DSandboxUi}
        viewStateOptions={viewState}
        blankConnection={connection}
        uiProviders={uiProviders}
        onIModelAppInit={() => { IModelApp.viewManager.onViewOpen.addOnce(setupView); }}
      />
    </>
  );
};

export default ClosestPointOnCurveApp;
