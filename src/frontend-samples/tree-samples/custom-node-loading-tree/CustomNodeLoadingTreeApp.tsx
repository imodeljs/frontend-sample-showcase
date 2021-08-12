/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { CustomNodeLoadingTree } from "./CustomNodeLoadingTreeComponent";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";
import "./CustomNodeLoadingTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomNodeLoadingTree), default: true, requiresIModelConnection: true }];

const CustomNodeLoadingTreeApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Data in this tree is loaded using two data providers: 'Presentation Hierarchy' nodes are loaded using Presentation rules and 'In Memory Hierarchy' nodes are loaded from memory.");

  return (<>
    {sampleIModelInfo?.iModelName && sampleIModelInfo.contextId && sampleIModelInfo.iModelId &&
      <Viewer
        contextId={sampleIModelInfo.contextId}
        iModelId={sampleIModelInfo.iModelId}
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        frontstages={frontstages}
        defaultUiConfig={default3DSandboxUi}
        theme="dark"
      />}
  </>);
};

export default CustomNodeLoadingTreeApp;
