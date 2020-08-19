/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/DataProvider/Trees.scss";
import { TableNodeTree } from "./CustomTableNodeTreeApp";
import "./TableNodeTree.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";

export class TableNodeTreeUI extends React.Component<{}> {

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
