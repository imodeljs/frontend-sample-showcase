/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { TableNodeTree } from "./CustomTableNodeTreeApp";
import "./TableNodeTree.scss";
import { ControlPane } from "common/ControlPane/ControlPane";

export default class TableNodeTreeUI extends React.Component<{}> {

  public render() {
    return (
      <>
        <ControlPane instructions="This tree showcases the ability to have multiple columns while still allowing for the expansion and collapsing of data."></ControlPane>
        <div className="sample-tree tree">
          <TableNodeTree></TableNodeTree>
        </div>
      </>
    );
  }

}
