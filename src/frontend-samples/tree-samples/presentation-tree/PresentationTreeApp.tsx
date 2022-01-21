/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { PresentationTree } from "./PresentationTreeComponent";
import { Viewer } from "@itwin/web-viewer-react";
import "./PresentationTree.scss";

const frontstages = [{ provider: new BlankFrontstage(PresentationTree), default: true, requiresIModelConnection: true }];

const PresentationTreeApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Data in this tree is loaded using Presentation rules.");

  return (<>
    {sampleIModelInfo?.iModelName && sampleIModelInfo.contextId && sampleIModelInfo.iModelId &&
      <Viewer
        iTwinId={sampleIModelInfo.contextId}
        iModelId={sampleIModelInfo.iModelId}
        authClient={AuthorizationClient.oidcClient}
        enablePerformanceMonitors={true} frontstages={frontstages}
        defaultUiConfig={default3DSandboxUi}
        theme="dark"
      />}
  </>);
};

export default PresentationTreeApp;
