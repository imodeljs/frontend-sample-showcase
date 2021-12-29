/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import { CustomWebfontIconsTree } from "./CustomWebfontIconsTreeComponent";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import "./CustomWebfontIconsTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomWebfontIconsTree), default: true, requiresIModelConnection: true }];

const CustomWebfontIconsTreeApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("In this tree an icon defined in Presentation rules is rendered for each node.");

  return (<>
    {sampleIModelInfo?.iModelName && sampleIModelInfo.contextId && sampleIModelInfo.iModelId &&
      <Viewer
        iTwinId={sampleIModelInfo.contextId}
        iModelId={sampleIModelInfo.iModelId}
        authConfig={{ getAccessToken: AuthorizationClient.oidcClient.getAccessToken, onAccessTokenChanged: AuthorizationClient.oidcClient.onAccessTokenChanged }}
        frontstages={frontstages}
        defaultUiConfig={default3DSandboxUi}
        theme="dark"
      />}
  </>);
};

export default CustomWebfontIconsTreeApp;
