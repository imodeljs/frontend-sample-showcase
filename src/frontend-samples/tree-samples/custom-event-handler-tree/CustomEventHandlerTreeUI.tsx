/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/DataProvider/Trees.scss";
import { CustomEventHandlerTree } from "./CustomEventHandlerTreeApp";

export class CustomEventHandlerTreeUI extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode) => void }> {

  public render() {
    this.props.setupControlPane("This tree demonstrates the interaction between tree node selection and checkbox selection. Selecting a tree node checks the corresponding checkbox, and deselects all other checkboxes.");
    return (
      <>
        <div className="tree sample-tree">
          <CustomEventHandlerTree></CustomEventHandlerTree>
        </div>
      </>
    );
  }

}
