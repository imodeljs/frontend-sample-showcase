/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import React, { FunctionComponent, useMemo } from "react";
import { SwipingComparisonWidgetProvider } from "./SwipingComparisonWidget";

const containerId = "swiping_comparison_app_container";
const uiProviders = [new SwipingComparisonWidgetProvider(containerId)];

const SwipingComparisonApp: FunctionComponent = () => {
  const getDefaultView = React.useCallback(async (iModelConnection: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    return viewState;
  }, []);
  const viewportOptions = useMemo(() => ({ viewState: getDefaultView }), [getDefaultView]);
  const sampleIModelInfo = useSampleWidget("Drag the divider to compare the two halves of the view. Try rotating the view with the 'Lock Plane' toggle on and off.", [SampleIModels.ExtonCampus]);

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <div id={containerId} className="sample-app-container">
          <Viewer
            iTwinId={sampleIModelInfo.contextId}
            iModelId={sampleIModelInfo.iModelId}
            authClient={AuthorizationClient.oidcClient}
            enablePerformanceMonitors={true}
            viewportOptions={viewportOptions}
            mapLayerOptions={mapLayerOptions}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={uiProviders}
          />
        </div>
      }
    </>
  );

};

export default SwipingComparisonApp;
