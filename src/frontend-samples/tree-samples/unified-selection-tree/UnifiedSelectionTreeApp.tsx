/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useMemo } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { UnifiedSelectionWidgetProvider } from "./UnifiedSelectionTreeWidget";

const uiProviders = [new UnifiedSelectionWidgetProvider()];

const UnifiedSelectionApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("This tree synchronizes node selections with the viewport. Selecting nodes will cause their corresponding visuals to be highlighted.");

  const viewportOptions = useMemo(() => ({
    viewState: ViewSetup.getDefaultView,
  }), []);

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
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default3DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default UnifiedSelectionApp;
