/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { FireDecorationWidgetProvider } from "./FireDecorationWidget";
import { IModelConnection } from "@itwin/core-frontend";

const uiProviders = [new FireDecorationWidgetProvider()];

const FireDecorationApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the 'Place' button to create a new fire particle emitter. After placing, use the controls to configure the new emitter.", [SampleIModels.Villa]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return ViewSetup.getDefaultView(iModelConnection);
  };

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
          viewportOptions={{ viewState: _initialViewstate }}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default FireDecorationApp;
