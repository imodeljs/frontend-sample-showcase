/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { ShowcaseToolAdmin } from "./TooltipCustomizeApi";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import { IModelConnection } from "@itwin/core-frontend";
import { TooltipCustomizeWidgetProvider } from "./TooltipCustomizeWidget";

const uiProviders = [new TooltipCustomizeWidgetProvider()];

const TooltipCustomizeApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Hover the mouse pointer over an element to see the tooltip.  Use these options to control it.");

  const _initialViewstate = async (iModelConnection: IModelConnection) => {
    return ViewSetup.getDefaultView(iModelConnection);
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          iTwinId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authClient={AuthorizationClient.oidcClient}
          enablePerformanceMonitors={true}
          mapLayerOptions={mapLayerOptions}
          viewportOptions={{ viewState: _initialViewstate }}

          /** Pass the toolAdmin override directly into the viewer */
          toolAdmin={ShowcaseToolAdmin.initialize()}

          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default TooltipCustomizeApp;
