/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { VolumeQueryWidgetProvider } from "./VolumeQueryWidget";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { VolumeQueryApi } from "./VolumeQueryApi";

const uiProviders = [new VolumeQueryWidgetProvider()];

const VolumeQueryApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to query and color spatial elements in the iModel using a volume box.", [SampleIModels.RetailBuilding]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await VolumeQueryApi.getIsoView(iModelConnection);
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

export default VolumeQueryApp;
