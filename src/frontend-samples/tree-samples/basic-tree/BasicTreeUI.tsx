/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

import { BasicTree } from "./BasicTreeApp";

export class BasicTreeUI extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode) => void }> {

  public render() {
    this.props.setupControlPane("This is the default tree, allowing for the nesting of nodes within other nodes, which can be expanded or collapsed.");
    return (
      <>
        <div className="sample-tree">
          <BasicTree></BasicTree>
        </div>
      </>
    );
  }

}
