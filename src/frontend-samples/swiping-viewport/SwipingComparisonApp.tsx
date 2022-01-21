/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent } from "react";
import "./SwipingComparison.scss";
import { SwipingComparisonWidgetProvider } from "./SwipingComparisonWidget";

const containerId = "swiping_comparison_app_container";
const uiProviders = [new SwipingComparisonWidgetProvider(containerId)];

const getDefaultView = async (iModelConnection: IModelConnection): Promise<ViewState> => {
  const viewState = await ViewSetup.getDefaultView(iModelConnection);
  return viewState;
};
const viewportOptions = { viewState: getDefaultView };

const SwipingComparisonApp: FunctionComponent = () => {
  // const viewport = useActiveViewport();
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
