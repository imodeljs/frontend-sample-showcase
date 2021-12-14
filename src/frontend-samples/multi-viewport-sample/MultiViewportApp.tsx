/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer, ViewerFrontstage } from "@itwin/web-viewer-react";
import { IModelConnection } from "@itwin/core-frontend";
import { MultiViewportWidgetProvider } from "./MultiViewportWidget";
import { MultiViewportFrontstage } from "./MultiViewportFrontstageProvider";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import "./multi-view-sample.scss";

const uiProviders = [new MultiViewportWidgetProvider()];

const MultiViewportApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls at the top-right to navigate the model.  Toggle to sync the viewports in the controls below.  Navigating will not change the selected viewport.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();
  const [frontStages, setFrontstages] = useState<ViewerFrontstage[]>([]);

  useEffect(() => {
    setFrontstages(() => [{ provider: new MultiViewportFrontstage(), default: true, requiresIModelConnection: true }]);
  }, [sampleIModelInfo]);

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);

    setFrontstages(() => [{ provider: new MultiViewportFrontstage(viewState), default: true }]);

    setViewportOptions({ viewState });
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
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
