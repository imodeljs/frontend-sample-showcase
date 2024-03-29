/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent, useCallback } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, StandardViewId, ViewState } from "@itwin/core-frontend";
import { MarkerPinWidgetProvider } from "./MarkerPinWidget";

const uiProviders = [new MarkerPinWidgetProvider()];

const MarkerPinApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.");

  /** Get a top-down view from the default viewstate of the model */
  const getTopView = useCallback(async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    // The marker pins look better in a top view
    viewState.setStandardRotation(StandardViewId.Top);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);

    return viewState;
  }, []);

  const _initialViewstate = useCallback(async (iModelConnection: IModelConnection) => {
    return getTopView(iModelConnection);
  }, [getTopView]);

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

export default MarkerPinApp;
