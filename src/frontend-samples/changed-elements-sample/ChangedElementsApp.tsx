/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection } from "@itwin/core-frontend";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent } from "react";
import { ChangedElementsApi } from "./ChangedElementsApi";
import { ChangedElementsClient } from "./ChangedElementsClient";
import { ChangedElementsWidgetProvider } from "./ChangedElementsWidget";
import { MessageRenderer } from "@itwin/core-react";

const uiProviders = [new ChangedElementsWidgetProvider()];

const ChangedElementsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the drop down to select the named version to compare against.  Observe the changed elements are emphasized with color.  Unchanged elements are faded grey.", [SampleIModels.Stadium]);

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    // Populate the information needed for this sample.
    await ChangedElementsClient.populateContext(iModelConnection);
    await ChangedElementsApi.populateVersions();

    return ViewSetup.getDefaultView(iModelConnection);
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
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          viewportOptions={{ viewState: _initialViewstate }}
          mapLayerOptions={mapLayerOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default ChangedElementsApp;
