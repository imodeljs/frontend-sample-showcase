/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

// START VIEW_SETUP
const ViewportOnlyApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toolbar at the top-right to navigate the model.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };
  // END VIEW_SETUP

  // START VIEWER
  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          onIModelConnected={_oniModelReady}
        />
      }
    </>
  );
  // END VIEWER
};

export default ViewportOnlyApp;
