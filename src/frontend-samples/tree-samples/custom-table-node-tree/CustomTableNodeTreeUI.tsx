/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ControlPaneHeader } from "Components/ControlPaneHeader/ControlPaneHeader";
import "common/DataProvider/Trees.scss";
import { TableNodeTree } from "./CustomTableNodeTreeApp";
import "./TableNodeTree.scss";

export class TableNodeTreeUI extends React.Component<{}> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="This tree showcases the ability to have multiple columns while still allowing for the expansion and collapsing of data."></ControlPaneHeader>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <div className="sample-tree tree">
          <TableNodeTree></TableNodeTree>
        </div>
      </>
    );
  }

}
