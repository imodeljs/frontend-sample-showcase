/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { ToolbarButtonProvider } from "./ToolbarButtonProvider";
import { AuthorizationClient, default3DAppUi, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

const uiProviders = [new ToolbarButtonProvider()];

const ToolbarButtonApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Press the Lightbulb button tool at the top of the screen.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
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
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DAppUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default ToolbarButtonApp;
