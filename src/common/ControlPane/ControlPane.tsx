/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Button } from "@itwin/itwinui-react";
import * as React from "react";
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
          <Button size={"large"} styleType={"high-visibility"} className="show-control-pane-button" onClick={this.switchCollapse.bind(this)}>Show Control Pane</Button>
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
            <svg className="minimize-button control-pane-minimize" onClick={this.switchCollapse.bind(this)}>
              <use href="icons.svg#minimize"></use>
              <title>Minimize</title>
            </svg>
          </div>
          {this.props.iModelSelector ? this.props.iModelSelector : undefined}
          {this.props.controls ? <hr></hr> : undefined}
          {this.props.controls ? this.props.controls : undefined}
        </div>
      </>
    );
  }
}
