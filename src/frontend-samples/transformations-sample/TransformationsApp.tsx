/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, getIModelInfo, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { CheckpointConnection, IModelConnection, ViewCreator3d } from "@itwin/core-frontend";
import { TransformationsWidgetProvider } from "./TransformationsWidget";
import { TransformationsFrontstage } from "./TransformationsFrontstageProvider";
import "./transformations-sample.scss";
import { getMapLayerKeys } from "common/MapLayerKeys/MapLayerKeys";

const uiProviders = [new TransformationsWidgetProvider()];

const TransformationsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls at the top-right to navigate the model.  Toggle to sync the viewports in the controls below.  Navigating will not change the selected viewport.", [SampleIModels.Stadium]);
  const [frontStages, setFrontstages] = useState<ViewerFrontstage[]>([]);

  useEffect(() => {
    setFrontstages(() => [{ provider: new TransformationsFrontstage(), default: true, requiresIModelConnection: true }]);
  }, [sampleIModelInfo]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    const vf = viewState.viewFlags.copy({});

    // Connect to iModel
    // START TRANSFORMED_IMODEL_CONNECTION
    const connectionInfo = await getIModelInfo(SampleIModels.TransformedStadium);
    const connection2 = await CheckpointConnection.openRemote(connectionInfo.contextId, connectionInfo.iModelId);
    // END TRANSFORMED_IMODEL_CONNECTION

    // Get ViewState
    const viewCreator2 = new ViewCreator3d(connection2);
    const viewState2 = await viewCreator2.createDefaultView({ skyboxOn: true });
    viewState2.viewFlags = vf;

    setFrontstages([{ provider: new TransformationsFrontstage(viewState, viewState2, connection2), default: true }]);

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
          mapLayerOptions={getMapLayerKeys()}
          frontstages={frontStages}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default TransformationsApp;
