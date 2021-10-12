/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";
import { ScientificVizWidgetProvider } from "./ScientificVizWidget";

const uiProviders = [new ScientificVizWidgetProvider()];
const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
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
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        theme={"dark"}
        defaultUiConfig={default3DSandboxUi}
        viewStateOptions={viewState}
        blankConnection={connection}
        uiProviders={uiProviders}
        viewportOptions={{ disableDefaultViewOverlay: true }}
      />
    </>
  );
};

export default ScientificVizApp;
