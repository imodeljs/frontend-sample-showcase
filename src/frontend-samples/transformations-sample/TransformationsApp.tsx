/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer, ViewerFrontstage } from "@bentley/itwin-viewer-react";
import { CheckpointConnection, IModelConnection, ViewCreator3d } from "@bentley/imodeljs-frontend";
import { MultiViewportWidgetProvider } from "./TransformationsWidget";
import { MultiViewportFrontstage } from "./TransformationsFrontstageProvider";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import "./transformations-sample.scss";

const uiProviders = [new MultiViewportWidgetProvider()];
let frontStages: ViewerFrontstage[] = [];

const MultiViewportApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls at the top-right to navigate the model.  Toggle to sync the viewports in the controls below.  Navigating will not change the selected viewport.", [SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  // Cleanup frontStages
  useEffect(() => {
    return () => { frontStages = []; };
  }, []);

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);

    const connection2 = await CheckpointConnection.openRemote("5eb49cbc-4e3c-41e7-934c-98f07df37f13", "00f2d207-4cc1-44f9-b145-5749ef9adb88");
    const viewCreator = new ViewCreator3d(connection2);
    const viewState2 = await viewCreator.createDefaultView({ skyboxOn: true });

    // Remove the last frontstage, if there was one, to reinject the initalized viewstate on modelchange
    frontStages.pop();
    frontStages.push({ provider: new MultiViewportFrontstage(viewState, viewState2, connection2), default: true, requiresIModelConnection: true });

    setViewportOptions({ viewState });
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
          viewportOptions={viewportOptions}
          frontstages={frontStages}
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default MultiViewportApp;
