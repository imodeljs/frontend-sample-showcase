/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { DisplayStylesWidgetProvider } from "./DisplayStylesWidget";
import { IModelConnection } from "@itwin/core-frontend";
import "./DisplayStyles.scss";

const uiProviders = [new DisplayStylesWidgetProvider()];

const DisplayStylesApp: FunctionComponent = () => {

  const sampleIModelInfo = useSampleWidget("Use the drop down below to change the display style. Edit the \"Custom\" style in \"Style.ts\" and re-run the sample to see the changes.", [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium]);

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

export default DisplayStylesApp;
