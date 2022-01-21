/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { IModelApp, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { GlobalDisplayWidgetProvider } from "./GlobalDisplayWidget";
import { GlobalDisplayApi } from "./GlobalDisplayApi";
import { MessageRenderer } from "@itwin/core-react";
import { getMapLayerKeys } from "common/MapLayerKeys/MapLayerKeys";

const uiProviders = [new GlobalDisplayWidgetProvider()];

const GlobalDisplayApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Using the Global Display Controls Widget, type in the name of a location (e.g., \"Mount Everest\", \"White House\", your own address, etc), then click the button to travel there.", [SampleIModels.MetroStation]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      // The grid just gets in the way - turn it off.
      viewport.viewFlags = viewport.view.viewFlags.with("grid", false);

      // We're not interested in seeing the contents of the iModel, only the global data.
      if (viewport.view.isSpatialView())
        viewport.view.modelSelector.models.clear();
    });

    return await GlobalDisplayApi.getInitialView(iModelConnection);
  };

  return (
    <>
      <MessageRenderer message={""} />
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          viewportOptions={{ viewState: _initialViewstate }}
          defaultUiConfig={default3DSandboxUi}
          mapLayerOptions={getMapLayerKeys()}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default GlobalDisplayApp;
