/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ValidationWidgetProvider } from "./ValidationWidget";
import { ValidationTableWidgetProvider } from "./ValidationTableWidget";

const uiProviders = [new ValidationWidgetProvider(), new ValidationTableWidgetProvider()];

const ValidationApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggles below to show marker pins or zoom to a validation rule violation.  Click a marker or table entry to review these rule violations.", [SampleIModels.BayTown]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    setViewportOptions({ viewState });
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default2DSandboxUi}
          onIModelConnected={_oniModelReady}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default ValidationApp;
