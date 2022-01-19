/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@itwin/core-geometry";
import { Cartographic } from "@itwin/core-common";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { CustomCheckboxesTreeComponent } from "./CustomCheckboxesTreeComponent";
import "./CustomCheckboxesTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomCheckboxesTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(),
};

const CustomCheckboxesTreeApp: FunctionComponent = () => {
  useSampleWidget("This tree demonstrates the ability to render customized icons as the checkboxes for the nodes in a tree.", []);

  return (
    <>
      <BlankViewer
        authClient={AuthorizationClient.oidcClient}
        enablePerformanceMonitors={true}
        defaultUiConfig={default3DSandboxUi}
        blankConnection={connection}
        frontstages={frontstages}
        theme={"dark"}
      />
    </>
  );
};

export default CustomCheckboxesTreeApp;
