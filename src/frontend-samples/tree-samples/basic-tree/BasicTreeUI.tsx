/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ControlPaneHeader } from "Components/ControlPaneHeader/ControlPaneHeader";

import { BasicTree } from "./BasicTreeApp";

export class BasicTreeUI extends React.Component<{}> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="This is the default tree, allowing for the nesting of nodes within other nodes, which can be expanded or collapsed."></ControlPaneHeader>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <div className="sample-tree">
          <BasicTree></BasicTree>
        </div>
      </>
    );
  }

}
