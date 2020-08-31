/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import DisplayStylesApp from "./DisplayStylesApp";
import { DisplayStyle } from "./Styles";
import { Toggle } from "@bentley/ui-core";

interface DisplayStylesUIState {
  activePresetIndex: number;
  merge: boolean;
  viewport?: Viewport;
}

interface DisplayStylesUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
  displayStyles: DisplayStyle[];
}

const CUSTOM_STYLE_INDEX = 0;

export default class DisplayStylesUI extends React.Component<DisplayStylesUIProps, DisplayStylesUIState> {

  public state: DisplayStylesUIState = { activePresetIndex: 2, merge: false };

  // Called by the control and will update the active display style.
  private readonly _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.value, 10);
    this.setState({ activePresetIndex: index });
  }

  // Called by the control and updates wether to also apply the Custom display style.
  private readonly _onToggle = (isOn: boolean) => {
    this.setState({ merge: isOn });
  }

  // Will be triggered once when the iModel is loaded.
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
        this.setState({ viewport });
      });
    else
      this.setState({ viewport: vp });
  }

  /** A render method called when the state or props are changed. */
  public componentDidUpdate(_prevProp: DisplayStylesUIProps, prevState: DisplayStylesUIState) {
    let updateDisplayStyle = false;
    if (this.state.viewport?.viewportId !== prevState.viewport?.viewportId)
      updateDisplayStyle = true;
    if (this.state.activePresetIndex !== prevState.activePresetIndex)
      updateDisplayStyle = true;
    if (this.state.merge !== prevState.merge)
      updateDisplayStyle = true;

    if (updateDisplayStyle && undefined !== this.state.viewport) {
      const style = this.props.displayStyles[this.state.activePresetIndex];
      DisplayStylesApp.applyDisplayStyle(this.state.viewport, style);
      if (this.state.merge && CUSTOM_STYLE_INDEX !== this.state.activePresetIndex) {
        const custom = this.props.displayStyles[CUSTOM_STYLE_INDEX];
        DisplayStylesApp.applyDisplayStyle(this.state.viewport, custom);
      }
    }
  }

  private getControls(): React.ReactNode {
    const toggleTooltip = "Toggling on will apply the \"Custom\" style in \"Styles.ts\" after apply the selected style.";
    const entries = this.props.displayStyles
      .map((styles) => styles.name)
      .map((name, index) => <option key={index} value={index}>{name}</option>);
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Style:</span>
        <select value={this.state.activePresetIndex} onChange={this._onChange} style={{ width: "fit-content" }}>
          {entries}
        </select>
        <span>
          <span style={{ marginRight: "1em" }} className="icon icon-help" title={toggleTooltip}></span>
          <span>Merge with Custom:</span>
        </span>
        <Toggle isOn={this.state.merge} onChange={this._onToggle} />
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    const instruction = "Use the drop down below to change the display styles. Edit the \"Custom\" style in \"Style.ts\" and re-run the sample to see the changes.";
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions={instruction} iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
