/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { ZoomToElementsWidgetProvider } from "./ZoomToElementsWidget";
import { getMapLayerKeys } from "common/MapLayerKeys/MapLayerKeys";

const uiProviders = [new ZoomToElementsWidgetProvider()];

const ZoomToElementsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Select one or more elements.  Click plus (+) to capture their ids into a list.  Set the options and then click Zoom to Elements.", [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium]);

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
          mapLayerOptions={getMapLayerKeys()}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default ZoomToElementsApp;
