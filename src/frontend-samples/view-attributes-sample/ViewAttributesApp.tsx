/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { ViewAttributesWidgetProvider } from "./ViewAttributesWidget";
import { IModelApp, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { UiFramework } from "@itwin/appui-react";
import { ViewAttributesApi } from "./ViewAttributesApi";
import { DisableUiStateStorage } from "./DisableUiStateStorage";

const uiProviders = [new ViewAttributesWidgetProvider()];

const ViewAttributesApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.House, SampleIModels.MetroStation]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      ViewAttributesApi.setAttrValues(_vp, ViewAttributesApi.settings);
    });

    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    return viewState;
  };

  const _onIModelAppInit = async () => {
    await UiFramework.setUiStateStorage(new DisableUiStateStorage());
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          onIModelAppInit={_onIModelAppInit}
          authConfig={{ getAccessToken: AuthorizationClient.oidcClient.getAccessToken, onAccessTokenChanged: AuthorizationClient.oidcClient.onAccessTokenChanged }}
          viewportOptions={{ viewState: _initialViewstate }}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default ViewAttributesApp;
