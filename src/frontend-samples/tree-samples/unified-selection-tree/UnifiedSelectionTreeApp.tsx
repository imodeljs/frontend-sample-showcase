/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { UnifiedSelectionWidgetProvider } from "./UnifiedSelectionTreeWidget";
import { getMapLayerKeys } from "common/MapLayerKeys/MapLayerKeys";

const uiProviders = [new UnifiedSelectionWidgetProvider()];

const UnifiedSelectionApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("This tree synchronizes node selections with the viewport. Selecting nodes will cause their corresponding visuals to be highlighted.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          viewportOptions={viewportOptions}
          mapLayerOptions={getMapLayerKeys()}
          defaultUiConfig={default3DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
          onIModelConnected={_oniModelReady}
        />
      }
    </>
  );
};

export default UnifiedSelectionApp;
