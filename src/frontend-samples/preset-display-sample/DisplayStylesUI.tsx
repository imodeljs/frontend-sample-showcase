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

interface DisplayStylesUIState {
  activePresetIndex: number;
  viewport?: Viewport;
}

interface DisplayStylesUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
  displayStyles: DisplayStyle[];
}

export default class DisplayStylesUI extends React.Component<DisplayStylesUIProps, DisplayStylesUIState> {

  public state: DisplayStylesUIState = { activePresetIndex: 2 };

  private initViewport(viewport: Viewport) {
    DisplayStylesApp.applyDisplayStyle(viewport, this.props.displayStyles[this.state.activePresetIndex]);
    this.setState({ viewport });
  }

  // Called by the control and will update the state and viewport.
  private readonly _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.viewport)
      return;
    const index = Number.parseInt(event.target.value, 10);
    DisplayStylesApp.applyDisplayStyle(this.state.viewport, this.props.displayStyles[index]);
    this.setState({ activePresetIndex: index });
  }

  // Will be triggered once when the iModel is loaded.
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
        this.initViewport(viewport);
      });
    else
      this.initViewport(vp);
  }

  private getControls(): React.ReactNode {
    return <span className={"sample-options-2col"}>
      <span>Select Style:</span>
      <select value={this.state.activePresetIndex} onChange={this._onChange}>
        {
          this.props.displayStyles
            .map((styles) => styles.name)
            .map((name, index) => <option key={index} value={index}>{name}</option>)
        }
      </select>
    </span>;
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the dropdown bellow to change the display styles." iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
