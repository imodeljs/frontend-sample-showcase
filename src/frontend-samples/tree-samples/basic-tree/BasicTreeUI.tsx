/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

import { BasicTree } from "./BasicTreeApp";
import { ControlPane } from "common/ControlPane/ControlPane";

export default class BasicTreeUI extends React.Component<{}> {

  public render() {
    return (
      <>
        <ControlPane instructions="This is the default tree, allowing for the nesting of nodes within other nodes, which can be expanded or collapsed."></ControlPane>
        <div className="sample-tree">
          <BasicTree></BasicTree>
        </div>
      </>
    );
  }

}
