/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./ControlPane.scss";

export class ControlPane extends React.Component<{ instructions: string, onCollapse: () => void, controls?: React.ReactNode, iModelSelector?: React.ReactNode, className?: string }> {
  public render() {
    // This allows for the addition of a class name to the collapsed button container.
    // This enabled custom styling to be applied to the container as well as the control pane since they cannot be manually
    // assigned class names within the sample
    if (this.props.className)
      document.getElementsByClassName("collapsed-button-container")[0].classList.add(this.props.className);

    return (
      <>
        <div className="sample-ui">
          <div className="control-pane-header">
            <div className="sample-instructions">
              <span>{this.props.instructions}</span>
            </div>
            <svg className="control-pane-close-button minimize-button" onClick={this.props.onCollapse}>
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
