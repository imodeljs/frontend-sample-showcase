/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d, Vector3d } from "@itwin/core-geometry";
import { BlankConnectionProps, IModelApp, ScreenViewport, StandardViewId } from "@itwin/core-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Simple3dWidgetProvider } from "./Simple3dWidget";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";

const uiProviders = [new Simple3dWidgetProvider()];

const connection: BlankConnectionProps = {
  name: "GeometryConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(-15, -15, -15, 15, 15, 15),
};
const viewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { grid: true, renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: true,
  lookAt: {
    eyePoint: { x: 25, y: 25, z: 25 },
    targetPoint: { x: 0, y: 0, z: 0 },
    upVector: new Vector3d(0, 0, 1),
  },
};

const setupView = (vp: ScreenViewport) => {
  if (vp && vp.view.is3d()) {
    vp.setStandardRotation(StandardViewId.Iso);
    vp.synchWithView();
  }
};

const Simple3dApp: FunctionComponent = () => {
  useSampleWidget("Select a shape and adjust.", []);

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

export default Simple3dApp;
