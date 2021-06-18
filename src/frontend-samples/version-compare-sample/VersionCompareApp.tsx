/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@bentley/bentleyjs-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import "common/samples-common.scss";
import React, { FunctionComponent, useEffect, useState } from "react";
import { VersionCompareApi } from "./VersionCompareApi";
import { VersionCompareWebApi } from "./VersionCompareWebApi";
import { VersionCompareWidgetProvider } from "./VersionCompareWidget";

const uiProviders = [new VersionCompareWidgetProvider()];

const VersionCompareApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Version Compare Sample", [SampleIModels.Stadium]);
  const [changeSetId, setChangeSetId] = useState<Id64String>();
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    await VersionCompareWebApi.populateContext(iModelConnection);
    await VersionCompareApi.populateVersions();
    IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
      const vf = vp.viewFlags.clone();
      vf.visibleEdges = false;
      vp.viewFlags = vf;
    });

    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };

  useEffect(() => {
    const handleChangesetIdUpdate = (id: Id64String) => {
      setChangeSetId(id);
    };
    const removeListener = VersionCompareApi.updateChangeSet.addListener(handleChangesetIdUpdate);

    return removeListener;
  });

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          changeSetId={changeSetId}
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

export default VersionCompareApp;
