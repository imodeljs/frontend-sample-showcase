/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { ShowcaseToolAdmin } from "./TooltipCustomizeApi";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, ViewSetup } from "@itwinjs-sandbox";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { TooltipCustomizeWidgetProvider } from "./TooltipCustomizeWidget";

const uiProviders = [new TooltipCustomizeWidgetProvider()];

const TooltipCustomizeApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Hover the mouse pointer over an element to see the tooltip.  Use these options to control it.");
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

          /** Pass the toolAdmin override directly into the viewer */
          toolAdmin={ShowcaseToolAdmin.initialize()}

          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default TooltipCustomizeApp;
