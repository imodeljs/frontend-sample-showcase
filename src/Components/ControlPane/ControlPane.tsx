/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

export class ControlPane extends React.Component<{ instructions: string, onCollapse: () => void, controls?: React.ReactNode, iModelSelector?: React.ReactNode }> {
  public render() {
    return (
      <>
        <div className="sample-ui">
          <div className="control-pane-header">
            <div className="sample-instructions">
              <span>{this.props.instructions}</span>
            </div>
            <i className="icon icon-visibility-hide-2 control-pane-toggle" onClick={this.props.onCollapse}></i>
          </div>
          {this.props.iModelSelector ? this.props.iModelSelector : undefined}
          {this.props.controls ? <hr></hr> : undefined}
          {this.props.controls ? this.props.controls : undefined}
        </div>

      </>
    );
  }
}
