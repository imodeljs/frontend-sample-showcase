/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Range3d } from "@bentley/geometry-core";
import { Cartographic } from "@bentley/imodeljs-common";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { CustomCheckboxesTreeComponent } from "./CustomCheckboxesTreeComponent";
import "./CustomCheckboxesTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomCheckboxesTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(),
};

const CustomCheckboxesTreeApp: FunctionComponent = () => {
  useSampleWidget("This tree demonstrates the ability to render customized icons as the checkboxes for the nodes in a tree.", []);

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

export default CustomCheckboxesTreeApp;
