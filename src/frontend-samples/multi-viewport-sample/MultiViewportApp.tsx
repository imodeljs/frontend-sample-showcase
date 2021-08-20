/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { MultiViewportWidgetProvider } from "./MultiViewportWidget";
import { MultiViewportFrontstage } from "./MultiViewportFrontstageProvider";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import "./multi-view-sample.scss";

const uiProviders = [new MultiViewportWidgetProvider()];
let frontStages: ViewerFrontstage[] = [];

const MultiViewportApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls at the top-right to navigate the model.  Toggle to sync the viewports in the controls below.  Navigating will not change the selected viewport.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  // Cleanup frontStages
  useEffect(() => {
    return () => { frontStages = []; };
  }, []);

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);

    // Remove the last frontstage, if there was one, to reinject the initalized viewstate on modelchange
    frontStages.pop();
    frontStages.push({ provider: new MultiViewportFrontstage(viewState), default: true, requiresIModelConnection: true });

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
