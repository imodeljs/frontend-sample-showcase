/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { AuthorizationClient, default3DSandboxUi, SampleIModels } from "@itwinjs-sandbox";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { ShadowStudyWidgetProvider } from "./ShadowStudyWidget";
import ShadowStudyApi from "./ShadowStudyApi";

const uiProviders = [new ShadowStudyWidgetProvider()];

const ShadowStudyApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Select iModel to change.", [SampleIModels.House, SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = React.useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ShadowStudyApi.getInitialView(iModelConnection);
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

export default ShadowStudyApp;
