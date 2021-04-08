/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ViewAttributesWidgetProvider } from "./ViewAttributesWidget";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import ViewAttributesApp from "./ViewAttributesApp";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

const ViewAttributesUI: FunctionComponent = () => {
  const [iModelContext, setiModelContext] = useState<{ iModelName: string, contextId: string, iModelId: string }>();
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  useEffect(() => {
    IModelSetup.setIModelList([SampleIModels.MetroStation]);
    _changeIModel();
  }, []);

  const _changeIModel = async (iModelName?: string) => {
    const info = await IModelSetup.getIModelInfo(iModelName as SampleIModels);
    setiModelContext({ iModelName: info.iModelName, contextId: info.contextId, iModelId: info.iModelId });
  };

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      ViewAttributesApp.setAttrValues(_vp, ViewAttributesApp.settings);
    });

    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };

  /** The sample's render method */
  return (
    <>
      { /** START Viewer */}
      {iModelContext && <Viewer
        contextId={iModelContext.contextId}
        iModelId={iModelContext.iModelId}
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        viewportOptions={viewportOptions}
        onIModelConnected={_oniModelReady}
        defaultUiConfig={default3DSandboxUi}
        theme="dark"
        uiProviders={[new ViewAttributesWidgetProvider()]}
      />
      }
      { /** End Viewer */}
    </>
  );

};

export default ViewAttributesUI;
