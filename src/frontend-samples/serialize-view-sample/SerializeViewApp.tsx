/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { SerializeViewWidgetProvider } from "./SerializeViewWidget";
import { IModelViews, sampleViewStates } from "./SampleViewStates";
import SerializeViewApi from "./SerializeViewApi";

const uiProviders = [new SerializeViewWidgetProvider()];

const SerializeViewApp: FunctionComponent = () => {
  const allSavedViews: IModelViews[] = [...sampleViewStates];
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.MetroStation, SampleIModels.RetailBuilding]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    /** Grab the IModel with views that match the imodel loaded. */
    const iModelWithViews = allSavedViews.filter((iModelViews) => {
      return iModelViews.iModelId === iModelConnection.iModelId;
    });

    let viewState;
    /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
    if (iModelWithViews.length > 0) {
      const views = iModelWithViews[0].views;
      viewState = await SerializeViewApi.deserializeViewState(iModelConnection, views[0].view);
      if (viewState)
        return viewState;
    }
    viewState = await ViewSetup.getDefaultView(iModelConnection);
    return viewState;
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

export default SerializeViewApp;
