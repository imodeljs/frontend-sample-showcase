/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { CustomEventHandlerTree } from "./CustomEventHandlerTreeApp";
import { ControlPane } from "common/ControlPane/ControlPane";

export default class CustomEventHandlerTreeUI extends React.Component<{}> {

  public render() {
    return (
      <>
        <ControlPane instructions="This tree demonstrates the interaction between tree node selection and checkbox selection. Selecting a tree node checks the corresponding checkbox, and deselects all other checkboxes."></ControlPane>
        <div className="tree sample-tree">
          <CustomEventHandlerTree></CustomEventHandlerTree>
        </div>
      </>
    );
  }

}
