/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { VolumeQueryWidgetProvider } from "./VolumeQueryWidget";
import { IModelConnection } from "@itwin/core-frontend";
import { VolumeQueryApi } from "./VolumeQueryApi";

const uiProviders = [new VolumeQueryWidgetProvider()];

const VolumeQueryApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to query and color spatial elements in the iModel using a volume box.", [SampleIModels.RetailBuilding]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return VolumeQueryApi.getIsoView(iModelConnection);
  };

  /** The sample's render method */
  return (
    <>
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

export default VolumeQueryApp;
