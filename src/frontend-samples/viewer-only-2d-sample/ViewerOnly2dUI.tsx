/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import ViewerOnly2dApp from "./ViewerOnly2dApp";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ViewerOnly2dWidgetProvider } from "./ViewerOnly2dWidget";

const uiProviders = [new ViewerOnly2dWidgetProvider()];

const ViewportOnly2dUI: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("The 2D View Selector Widget shows a list of 2D models in this iModel.", [SampleIModels.House, SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const result = await ViewerOnly2dApp.getInitial2DModel(iModelConnection);
    const viewState = await ViewerOnly2dApp.createDefaultViewFor2dModel(iModelConnection, result);
    setViewportOptions({ viewState });
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
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

export default ViewportOnly2dUI;
