/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, tileAdminOptions, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { ThematicDisplayWidgetProvider } from "./ThematicDisplayWidget";

const uiProviders = [new ThematicDisplayWidgetProvider()];

const ThematicDisplayApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding]);

  const _initialView = async (iModelConnection: IModelConnection) => {
    const view = await ViewSetup.getDefaultView(iModelConnection);
    return view;
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
          viewportOptions={{ viewState: _initialView }}
          tileAdminOptions={tileAdminOptions}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default ThematicDisplayApp;
