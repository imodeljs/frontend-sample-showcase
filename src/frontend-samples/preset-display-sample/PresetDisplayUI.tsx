/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import PresetDisplayApp from "./PresetDisplayApp";
import { RenderingStyle } from "./Styles";

interface PresetDisplayUIState {
  activePresetIndex: number;
  viewport?: Viewport;
}

interface PresetDisplayUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
  renderingStyles: RenderingStyle[];
}

export default class PresetDisplayUI extends React.Component<PresetDisplayUIProps, PresetDisplayUIState> {

  public state: PresetDisplayUIState = { activePresetIndex: 0 };

  private readonly _onChangeAll = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.viewport)
      return;
    const index = Number.parseInt(event.target.value, 10);
    PresetDisplayApp.setPresetRenderingStyle(this.state.viewport, this.props.renderingStyles[index]);
    this.setState({ activePresetIndex: index });
  }
  private readonly _onChangePreset = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.viewport)
      return;
    const index = Number.parseInt(event.target.value, 10);
    PresetDisplayApp.setPresetRenderingStyle(this.state.viewport, this.props.renderingStyles[index]);
    this.setState({ activePresetIndex: index });
  }

  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
        this.setState({ viewport });
      });
    else
      this.setState({ viewport: vp });
  }

  public getControls(): React.ReactNode {
    return <select value={this.state.activePresetIndex} className={"sample-options-2col"} onChange={this._onChangeAll}>
        {
          this.props.renderingStyles
            .map((styles) => styles.name)
            .map((name, index) => <option key={index} value={index}>{name}</option>)
        }
      </select>;
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
