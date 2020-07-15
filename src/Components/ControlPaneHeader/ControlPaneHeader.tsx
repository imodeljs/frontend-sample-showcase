import * as React from "react";

export class ControlPaneHeader extends React.Component<{ instructions: string }> {
  public render() {
    return (<div className="control-pane-header">
      <div className="sample-instructions">
        <span>{this.props.instructions}</span>
      </div>
      <div className="control-pane-toggle" onClick={this.handleClick}></div>
    </div>);
  }

  public handleClick() {
    // Add the hide control pane tag to the sample content
    const sampleContent = document.getElementsByClassName("sample-content");
    sampleContent[0].classList.add("hide-control-pane");
  }
}
