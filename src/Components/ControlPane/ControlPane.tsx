import * as React from "react";

export class ControlPane extends React.Component<{ instructions: string, controls?: React.ReactNode, iModelSelector?: React.ReactNode }> {
  public render() {
    return (
      <>
        <div className="sample-ui">
          <div className="control-pane-header">
            <div className="sample-instructions">
              <span>{this.props.instructions}</span>
            </div>
            <div className="control-pane-toggle" onClick={this.handleClick}></div>
          </div>
          {this.props.iModelSelector ? this.props.iModelSelector : undefined}
          <hr></hr>
          {this.props.controls ? this.props.controls : undefined}
        </div>

      </>
    );
  }

  public handleClick() {
    // Add the hide control pane tag to the sample content
    const sampleContent = document.getElementsByClassName("sample-content");
    sampleContent[0].classList.add("hide-control-pane");
  }
}
