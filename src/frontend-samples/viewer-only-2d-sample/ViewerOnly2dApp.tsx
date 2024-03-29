/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { AuthorizationClient, default2DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget } from "@itwin/sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { ViewerOnly2dApi } from "./ViewerOnly2dApi";
import { ViewerOnly2dWidgetProvider } from "./ViewerOnly2dWidget";

const uiProviders = [new ViewerOnly2dWidgetProvider()];

const ViewportOnly2dApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("The 2D View Selector Widget shows a list of 2D models in this iModel.", [SampleIModels.House]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    const result = await ViewerOnly2dApi.getInitial2DModel(iModelConnection);
    const viewState = await ViewerOnly2dApi.createDefaultViewFor2dModel(iModelConnection, result);
    return viewState;
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true} viewportOptions={{ viewState: _initialViewstate }}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default2DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default ViewportOnly2dApp;
