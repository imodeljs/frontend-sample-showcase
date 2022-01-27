/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useState } from "react";
import { IModelConnection, ViewCreator2d, ViewState } from "@itwin/core-frontend";
import { ColorDef } from "@itwin/core-common";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import CrossProbingApi from "./CrossProbingApi";
import { CrossProbingFrontstageProvider } from "./CrossProbingFrontstageProvider";

const CrossProbingApp: React.FunctionComponent = () => {
  const [frontStages, setFrontStages] = useState<ViewerFrontstage[]>([]);
  const sampleIModelInfo = useSampleWidget("Click on an element in either of the views to zoom to corresponding element in the other view.", [SampleIModels.BayTown]);

  // Get first 2D view in iModel.
  const getFirst2DView = useCallback(async (imodel: IModelConnection): Promise<ViewState> => {
    const viewCreator = new ViewCreator2d(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    if (models.length === 0)
      throw new Error("No 2D models found in iModel.");

    return viewCreator.createViewForModel(models[0].id!, { bgColor: ColorDef.black });
  }, []);

  // When iModel is ready, initialize element selection listener and assign initial 2D view.
  const oniModelConnected = useCallback(async (iModelConnection: IModelConnection) => {
    // Add a listen to track what we are clicking
    CrossProbingApi.addElementSelectionListener(iModelConnection);
    // Cache the elements
    await CrossProbingApi.loadElementMap(iModelConnection);
    // Grab the proper viewstates
    const [viewState2d, viewState3d] = await Promise.all([getFirst2DView(iModelConnection), ViewSetup.getDefaultView(iModelConnection)]);
    // update our frontstage
    setFrontStages([{ provider: new CrossProbingFrontstageProvider(iModelConnection, viewState3d, viewState2d), default: true }]);
  }, [getFirst2DView]);

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
          frontstages={frontStages}
          mapLayerOptions={mapLayerOptions}
          onIModelConnected={oniModelConnected}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
        />
      }
    </>
  );

};

export default CrossProbingApp;

