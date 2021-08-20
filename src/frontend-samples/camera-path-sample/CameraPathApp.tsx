/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { CameraPathWidgetProvider } from "./CameraPathWidget";
import { RenderMode } from "@bentley/imodeljs-common";

const uiProviders = [new CameraPathWidgetProvider()];

const CameraPathApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the mouse wheel to scroll the camera along the predefined path. Click in the view to look around.", [SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.SmoothShade;
    return viewState;
  };

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await getInitialView(iModelConnection);
    setViewportOptions({ viewState });
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
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          onIModelConnected={_oniModelReady}
          defaultUiConfig={uiConfig}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default CameraPathApp;
