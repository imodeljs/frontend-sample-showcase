/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ViewerOnly2dApi } from "./ViewerOnly2dApi";
import { ViewerOnly2dWidgetProvider } from "./ViewerOnly2dWidget";

const uiProviders = [new ViewerOnly2dWidgetProvider()];

const ViewportOnly2dApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("The 2D View Selector Widget shows a list of 2D models in this iModel.", [SampleIModels.House, SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const result = await ViewerOnly2dApi.getInitial2DModel(iModelConnection);
    const viewState = await ViewerOnly2dApi.createDefaultViewFor2dModel(iModelConnection, result);
    setViewportOptions({ viewState });
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default2DSandboxUi}
          onIModelConnected={_oniModelReady}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default ViewportOnly2dApp;
