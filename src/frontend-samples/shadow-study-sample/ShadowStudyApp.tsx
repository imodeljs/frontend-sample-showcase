/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "common/samples-common.scss";
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { ShadowStudyWidgetProvider } from "./ShadowStudyWidget";
import ShadowStudyApi from "./ShadowStudyApi";

const uiProviders = [new ShadowStudyWidgetProvider()];

const ShadowStudyApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Select iModel to change.", [SampleIModels.House, SampleIModels.MetroStation]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return await ShadowStudyApi.getInitialView(iModelConnection);
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

export default ShadowStudyApp;
