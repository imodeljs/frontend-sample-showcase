/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";
import "./ControlPane.scss";

export class ControlPane extends React.Component<{ instructions: string, controls?: React.ReactNode, iModelSelector?: React.ReactNode }, { collapsed: boolean }> {

  public componentDidMount() {
    this.setState({ collapsed: false });
  }

  private switchCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({ collapsed });
  }

  public render() {
    if (this.state && this.state.collapsed) {
      return (
        <>
          <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-control-pane-button" onClick={this.switchCollapse.bind(this)}>Show Control Pane</Button>
        </>
      );
    }
    return (
      <>
        <div className="sample-ui">
          <div className="control-pane-header">
            <div className="sample-instructions">
              <span>{this.props.instructions}</span>
            </div>
            <i className="icon icon-visibility-hide-2 control-pane-toggle" onClick={this.switchCollapse.bind(this)}></i>
          </div>
          {this.props.iModelSelector ? this.props.iModelSelector : undefined}
          {this.props.controls ? <hr></hr> : undefined}
          {this.props.controls ? this.props.controls : undefined}
        </div>
      </>
    );
  }
}
