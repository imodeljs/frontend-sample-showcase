/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { SerializeViewWidgetProvider } from "./SerializeViewWidget";

const uiProviders = [new SerializeViewWidgetProvider()];

const SerializeViewApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.MetroStation]);

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default SerializeViewApp;
