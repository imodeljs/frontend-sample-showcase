/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { AuthorizationClient, default2DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, StandardViewId } from "@itwin/core-frontend";
import { ClashReviewWidgetProvider } from "./ClashReviewWidget";
import { ClashReviewTableWidgetProvider } from "./ClashReviewTableWidget";

const uiProviders = [new ClashReviewWidgetProvider(), new ClashReviewTableWidgetProvider()];

const ClashReviewApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggles below to show clash marker pins or zoom to a clash.  Click a marker or table entry to review clashes.", [SampleIModels.BayTown]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    return viewState;
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          viewportOptions={{ viewState: _initialViewstate }}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default2DSandboxUi}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default ClashReviewApp;
