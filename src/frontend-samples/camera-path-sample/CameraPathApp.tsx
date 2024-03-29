/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { CameraPathWidgetProvider } from "./CameraPathWidget";
import { RenderMode } from "@itwin/core-common";

const uiProviders = [new CameraPathWidgetProvider()];

const CameraPathApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the mouse wheel to scroll the camera along the predefined path. Click in the view to look around.", [SampleIModels.MetroStation]);

  const getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags = viewState.viewFlags.withRenderMode(RenderMode.SmoothShade);
    return viewState;
  };

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return getInitialView(iModelConnection);
  };

  /** Remove unnecessary tools  */
  const uiConfig = {
    ...default3DSandboxUi,
    navigationTools: {
      verticalItems: { walkView: false, cameraView: false },
      horizontalItems: { rotateView: false, panView: false, fitView: false, windowArea: false, undoView: false, redoView: false },
    },
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          viewportOptions={{ viewState: _initialViewstate }}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={uiConfig}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default CameraPathApp;
