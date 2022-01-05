/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { HyperModelingWidgetProvider } from "./HyperModelingWidget";
import HyperModelingApi from "./HyperModelingApi";

const uiProviders = [new HyperModelingWidgetProvider()];

const HyperModelingApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Using the Hyper-Modeling controls, enable or disable 2D graphics. Use the buttons to view a 2D sheet or drawing, or select a new marker to view a new section.", [SampleIModels.House]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return await ViewSetup.getDefaultView(iModelConnection);
  };

  const _onIModelInit = useCallback(() => {
    HyperModelingApi.onReady.addListener((view: ScreenViewport) => {
      HyperModelingApi.activateMarkerByName(view, "Section-Left")
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    });
  }, []);

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          onIModelAppInit={_onIModelInit}
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ getAccessToken: AuthorizationClient.oidcClient.getAccessToken, onAccessTokenChanged: AuthorizationClient.oidcClient.onAccessTokenChanged }}
          viewportOptions={{ viewState: _initialViewstate }}
          defaultUiConfig={default2DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default HyperModelingApp;
