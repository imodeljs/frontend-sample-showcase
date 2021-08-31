/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions, MessageRenderer } from "@bentley/ui-framework";
import { GlobalDisplayWidgetProvider } from "./GlobalDisplayWidget";
import { GlobalDisplayApi } from "./GlobalDisplayApi";

const uiProviders = [new GlobalDisplayWidgetProvider()];

const GlobalDisplayApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Using the Global Display Controls Widget, type in the name of a location (e.g., \"Mount Everest\", \"White House\", your own address, etc), then click the button to travel there.", [SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      // The grid just gets in the way - turn it off.
      viewport.view.viewFlags.grid = false;

      // We're not interested in seeing the contents of the iModel, only the global data.
      if (viewport.view.isSpatialView())
        viewport.view.modelSelector.models.clear();
    });
    const viewState = await GlobalDisplayApi.getInitialView(iModelConnection);
    setViewportOptions({ viewState });
  };

  return (
    <>
      <MessageRenderer />
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default3DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
          onIModelConnected={_oniModelReady}
        />
      }
    </>
  );
};

export default GlobalDisplayApp;
