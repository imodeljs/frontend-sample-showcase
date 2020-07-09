/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/DataProvider/Trees.scss";

import { CustomCheckboxesTree } from "./CustomCheckboxesTreeApp";

export class CustomCheckboxesTreeUI extends React.Component<{}> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>This tree demonstrates the ability to render customized icons as the checkboxes for the nodes in a tree.</span>
          </div>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <div className="sample-tree tree">
          <CustomCheckboxesTree></CustomCheckboxesTree>
        </div>
      </>
    );
  }

}
