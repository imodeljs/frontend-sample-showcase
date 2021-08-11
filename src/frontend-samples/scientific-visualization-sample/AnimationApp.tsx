import React, { FunctionComponent } from "react";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Cartographic, ColorDef, RenderMode } from "@bentley/imodeljs-common";
import { AnimationWidgetProvider } from "./AnimationWidget";

const uiProviders = [new AnimationWidgetProvider()];
const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(-20, -20, -20, 20, 20, 20),
};

const viewState: BlankConnectionViewState = {
  displayStyle: {
    backgroundColor: ColorDef.white,
  },
  viewFlags: {
    grid: true,
    renderMode: RenderMode.SolidFill,
  },
  setAllow3dManipulations: true,
};

const Simple3dApp: FunctionComponent = () => {
  useSampleWidget("An animated scientific visualization.", []);

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

export default Simple3dApp;