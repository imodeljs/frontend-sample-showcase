/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { SnowDecorationWidgetProvider } from "./SnowDecorationWidget";

const uiProviders = [new SnowDecorationWidgetProvider()];

const SnowDecorationApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Select iModel to change.", [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = React.useState<IModelViewportControlOptions>();

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

export default SnowDecorationApp;
