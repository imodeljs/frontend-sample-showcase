/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { HeatmapDecoratorWidgetProvider } from "./HeatmapDecoratorWidget";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";

const uiProviders = [new HeatmapDecoratorWidgetProvider()];

const HeatmapDecoratorApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the options below to control the heatmap visualization.");
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = (iModelConnection: IModelConnection) => {
    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        if (viewState.is3d()) {
          // To make the heatmap look better, lock the view to a top orientation with camera turned off.
          viewState.setAllow3dManipulations(false);
          viewState.turnCameraOff();
          viewState.setStandardRotation(StandardViewId.Top);
        }

        const range = viewState.computeFitRange();
        const aspect = ViewSetup.getAspectRatio();

        viewState.lookAtVolume(range, aspect);

        // The heatmap looks better against a white background.
        viewState.displayStyle.backgroundColor = ColorDef.white;
        setViewportOptions({ viewState });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
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

export default HeatmapDecoratorApp;
