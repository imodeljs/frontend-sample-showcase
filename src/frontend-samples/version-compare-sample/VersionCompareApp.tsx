/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import "common/samples-common.scss";
import React, { FunctionComponent, useState } from "react";
import { VersionCompareApi } from "./VersionCompareApi";
import { VersionCompareWebApi } from "./VersionCompareWebApi";
import { VersionCompareWidgetProvider } from "./VersionCompareWidget";

const uiProviders = [new VersionCompareWidgetProvider()];

const VersionCompareApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the drop down to select the named version to compare against.", [SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const oniModelReady = async (iModelConnection: IModelConnection) => {
    // Populate the information needed for this sample.
    await VersionCompareWebApi.populateContext(iModelConnection);
    await VersionCompareApi.populateVersions();

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
          onIModelConnected={oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default VersionCompareApp;
