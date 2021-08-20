/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { RealityDataWidgetProvider } from "./RealityDataWidget";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";

const uiProviders = [new RealityDataWidgetProvider()];

const RealityDataApp: FunctionComponent = () => {
  // START VIEW_SETUP
  const sampleIModelInfo = useSampleWidget("Use the toggle below for displaying the reality data in the model.", [SampleIModels.ExtonCampus, SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };
  // END VIEW_SETUP
  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        // START VIEWER
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
        // END VIEWER
      }
    </>
  );
};

export default RealityDataApp;
