/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { EmphasizeElementsWidgetProvider } from "./EmphasizeElementsWidget";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { ViewAttributesApi } from "frontend-samples/view-attributes-sample/ViewAttributesApi";

const uiProviders = [new EmphasizeElementsWidgetProvider()];

const EmphasizeElementsApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggle below for displaying the reality data in the model.", [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium]);
  const [viewportOptions, setViewportOptions] = React.useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      ViewAttributesApi.setAttrValues(_vp, ViewAttributesApi.settings);
    });

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
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default EmphasizeElementsApp;
