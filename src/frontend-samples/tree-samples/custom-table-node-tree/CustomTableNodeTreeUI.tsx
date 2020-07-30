/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/DataProvider/Trees.scss";
import { TableNodeTree } from "./CustomTableNodeTreeApp";
import "./TableNodeTree.scss";

export class TableNodeTreeUI extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode) => void }> {

  public render() {
    this.props.setupControlPane("This tree showcases the ability to have multiple columns while still allowing for the expansion and collapsing of data.");
    return (
      <>
        <div className="sample-tree tree">
          <TableNodeTree></TableNodeTree>
        </div>
      </>
    );
  }

}
