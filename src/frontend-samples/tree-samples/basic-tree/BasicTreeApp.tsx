/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { BasicTreeComponent } from "./BasicTreeComponent";
import { BlankViewer } from "@itwin/web-viewer-react";
import "./BasicTree.scss";

const frontstages = [{ provider: new BlankFrontstage(BasicTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
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
