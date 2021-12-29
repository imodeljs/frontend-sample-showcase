/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@itwin/core-geometry";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Cartographic, ColorDef, RenderMode } from "@itwin/core-common";
import { ScientificVizWidgetProvider } from "./ScientificVizWidget";

const uiProviders = [new ScientificVizWidgetProvider()];
const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(0, 0, -100, 50, 50, 50),
};

const viewState: BlankConnectionViewState = {
  displayStyle: {
    backgroundColor: ColorDef.white,
  },
  viewFlags: {
    grid: false,
    renderMode: RenderMode.SolidFill,
  },
  setAllow3dManipulations: true,
};

const ScientificVizApp: FunctionComponent = () => {
  useSampleWidget("Use the options below to choose a mesh and analysis channels.  Note that the 'Static' channels do not animate.", []);

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
        viewportOptions={{ supplyViewOverlay: () => { return <></> } }}
      />
    </>
  );
};

export default ScientificVizApp;
