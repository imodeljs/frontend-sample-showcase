/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { IModelConnection, ViewCreator2d, ViewState } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import CrossProbingApi from "./CrossProbingApi";
import { CrossProbingFrontstage } from "./CrossProbingFrontstageProvider";

let frontStages: ViewerFrontstage[] = [];

const CrossProbingApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Click on an element in either of the views to zoom to corresponding element in the other view.", [SampleIModels.BayTown]);

  // Cleanup fronstages when we switch samples
  useEffect(() => {
    return () => {
      frontStages = [];
    };
  }, []);

  // When iModel is ready, initialize element selection listener and assign initial 2D view.
  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    CrossProbingApi.addElementSelectionListener(iModelConnection);
    await CrossProbingApi.loadElementMap(iModelConnection);
    const [viewState2d, viewState3d] = await Promise.all([getFirst2DView(iModelConnection), ViewSetup.getDefaultView(iModelConnection)]);
    if (frontStages.length === 0)
      frontStages.push({ provider: new CrossProbingFrontstage(viewState3d, viewState2d), default: true });
  };

  // Get first 2D view in iModel.
  const getFirst2DView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewCreator = new ViewCreator2d(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    if (models.length === 0)
      throw new Error("No 2D models found in iModel.");

    return viewCreator.createViewForModel(models[0].id!, { bgColor: ColorDef.black });
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          frontstages={frontStages}
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
        />
      }
    </>
  );

};

export default CrossProbingApp;

