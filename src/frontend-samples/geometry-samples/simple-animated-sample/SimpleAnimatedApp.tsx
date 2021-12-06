/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnectionProps, IModelApp, ScreenViewport, StandardViewId } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { SimpleAnimatedWidgetProvider } from "./SimpleAnimatedWidget";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";

const uiProviders = [new SimpleAnimatedWidgetProvider()];

const connection: BlankConnectionProps = {
  name: "GeometryConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(-150, -150, 0, 1150, 1150, 0),
};
const viewState: BlankConnectionViewState = {
  displayStyle: { backgroundColor: ColorDef.white },
  viewFlags: { renderMode: RenderMode.SmoothShade },
  setAllow3dManipulations: false,
};

const setupView = (vp: ScreenViewport) => {
  if (vp && vp.view.is3d()) {
    vp.setStandardRotation(StandardViewId.Top);
    vp.synchWithView();
  }
};

const SimpleAnimatedApp: FunctionComponent = () => {
  useSampleWidget("An implementation of Conway's game of life.", []);

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
        onIModelAppInit={() => { IModelApp.viewManager.onViewOpen.addOnce(setupView); }}
      />
    </>
  );
};

export default SimpleAnimatedApp;

