/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { IotAlertWidgetProvider } from "./IotAlertWidget";

const uiProviders = [new IotAlertWidgetProvider()];

const IotAlertApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the iModel.", [SampleIModels.BayTown]);

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
          defaultUiConfig={{
            hidePropertyGrid: true,
            hideTreeView: true,
          }}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default IotAlertApp;
