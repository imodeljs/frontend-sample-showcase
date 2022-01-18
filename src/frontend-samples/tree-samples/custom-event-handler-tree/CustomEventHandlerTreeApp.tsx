/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { CustomEventHandlerTreeComponent } from "./CustomEventHandlerTreeComponent";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import "./CustomEventHandlerTree.scss";

const frontstages = [{ provider: new BlankFrontstage(CustomEventHandlerTreeComponent), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(),
};

const CustomEventHandlerTreeApp: FunctionComponent = () => {
  useSampleWidget("This tree demonstrates the interaction between tree node selection and checkbox selection. Selecting a tree node checks the corresponding checkbox, and deselects all other checkboxes.", []);

  return (
    <>
      <BlankViewer
        authClient={AuthorizationClient.oidcClient}
        enablePerformanceMonitors={true} defaultUiConfig={default3DSandboxUi}
        blankConnection={connection}
        frontstages={frontstages}
        theme={"dark"}
      />
    </>
  );

};

export default CustomEventHandlerTreeApp;
