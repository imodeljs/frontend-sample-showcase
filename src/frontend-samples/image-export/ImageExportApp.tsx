/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { ImageExportWidgetProvider } from "./ImageExportWidget";

const uiProviders = [new ImageExportWidgetProvider()];

const ImageExportApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use Image Export Controls Widget to export current viewport as an image.", [SampleIModels.House, SampleIModels.MetroStation]);

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

export default ImageExportApp;

