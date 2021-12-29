/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import "common/samples-common.scss";
import React, { FunctionComponent, useState } from "react";
import { ChangedElementsApi } from "./ChangedElementsApi";
import { ChangedElementsClient } from "./ChangedElementsClient";
import { ChangedElementsWidgetProvider } from "./ChangedElementsWidget";
import { MessageRenderer } from "@itwin/core-react";

const uiProviders = [new ChangedElementsWidgetProvider()];

const ChangedElementsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the drop down to select the named version to compare against.  Observe the changed elements are emphasized with color.  Unchanged elements are faded grey.", [SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const oniModelReady = async (iModelConnection: IModelConnection) => {
    // Populate the information needed for this sample.
    await ChangedElementsClient.populateContext(iModelConnection);
    await ChangedElementsApi.populateVersions();

    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };

  /** The sample's render method */
  return (
    <>
      <MessageRenderer message={""} />
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ getAccessToken: AuthorizationClient.oidcClient.getAccessToken, onAccessTokenChanged: AuthorizationClient.oidcClient.onAccessTokenChanged }}
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

export default ChangedElementsApp;
