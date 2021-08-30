/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { CustomEventHandlerTreeComponent } from "./CustomEventHandlerTreeComponent";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { Cartographic } from "@bentley/imodeljs-common";
import { Range3d } from "@bentley/geometry-core";
import "./CustomEventHandlerTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomEventHandlerTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(),
};

const CustomEventHandlerTreeApp: FunctionComponent = () => {
  useSampleWidget("This tree demonstrates the interaction between tree node selection and checkbox selection. Selecting a tree node checks the corresponding checkbox, and deselects all other checkboxes.", []);

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

export default CustomEventHandlerTreeApp;
