/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { CustomTableNodeTreeComponent } from "./CustomTableNodeTreeComponent";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import "./CustomTableNodeTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomTableNodeTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(),
};

const TableNodeTreeApp: FunctionComponent = () => {
  useSampleWidget("This tree showcases the ability to have multiple columns while still allowing for the expansion and collapsing of data.", []);

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

export default TableNodeTreeApp;
