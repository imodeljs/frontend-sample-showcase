/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";

export default class ViewportOnlyUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }>  {

  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        < ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={this.props.iModelSelector} ></ControlPane >
        { /* Viewport to display the iModel */}
        < SandboxViewport iModelName={this.props.iModelName} ></SandboxViewport>
      </>
    );

  }
}

