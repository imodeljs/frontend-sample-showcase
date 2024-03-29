/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@itwin/core-frontend";
import { EmphasizeElementsWidgetProvider } from "./EmphasizeElementsWidget";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { Viewer } from "@itwin/web-viewer-react";

const uiProviders = [new EmphasizeElementsWidgetProvider()];

const EmphasizeElementsApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Select one or more elements.  Click one of the Apply buttons.", [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return ViewSetup.getDefaultView(iModelConnection);
  };

  /** The sample's render method */
  return (
    // START VIEWER
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
    // END VIEWER
  );

};

export default EmphasizeElementsApp;
