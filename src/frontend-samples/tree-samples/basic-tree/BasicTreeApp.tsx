/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { Cartographic } from "@bentley/imodeljs-common";
import { Range3d } from "@bentley/geometry-core";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { BasicTreeComponent } from "./BasicTreeComponent";
import { BlankViewer } from "@bentley/itwin-viewer-react";
import "./BasicTree.scss";

const frontstages = [{ provider: new BlankFrontstage(BasicTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(),
};

const BasicTreeApp: FunctionComponent = () => {
  useSampleWidget("This is the default tree, allowing for the nesting of nodes within other nodes, which can be expanded or collapsed.", []);

  return (
    <>
      <BlankViewer
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        defaultUiConfig={default3DSandboxUi}
        blankConnection={connection}
        frontstages={frontstages}
        theme={"dark"}
      />
    </>
  );
};

export default BasicTreeApp;
