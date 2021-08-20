/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { DisplayStylesWidgetProvider } from "./DisplayStylesWidget";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import "./DisplayStyles.scss";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";

const uiProviders = [new DisplayStylesWidgetProvider()];

const DisplayStylesApp: FunctionComponent = () => {

  const sampleIModelInfo = useSampleWidget("Use the drop down below to change the display style. Edit the \"Custom\" style in \"Style.ts\" and re-run the sample to see the changes.", [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
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
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default DisplayStylesApp;
