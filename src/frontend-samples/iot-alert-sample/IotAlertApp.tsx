/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { IotAlertWidgetProvider } from "./IotAlertWidget";
import { MessageRenderer } from "@itwin/core-react";

const uiProviders = [new IotAlertWidgetProvider()];

const IotAlertApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the iModel.", [SampleIModels.BayTown]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return await ViewSetup.getDefaultView(iModelConnection);
  };

  /** The sample's render method */
  return (
    <>
      <MessageRenderer message={""} />
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
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

export default IotAlertApp;
