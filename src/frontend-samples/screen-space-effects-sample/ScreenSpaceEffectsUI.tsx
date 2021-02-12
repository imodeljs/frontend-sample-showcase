/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle } from "@bentley/geometry-core";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import { Select, Toggle } from "@bentley/ui-core";
import { effects, EffectsConfig, effectsConfig } from "./Effects";

interface UIState {
  activeEffectIndex: number;
  viewport?: ScreenViewport;
  effectsConfig: EffectsConfig;
}

interface UIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
  effectNames: string[];
}

export default class ScreenSpaceEffectsUI extends React.Component<UIProps, UIState> {
  public state: UIState = {
    activeEffectIndex: 0,
    effectsConfig,
  };

  private readonly _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ activeEffectIndex: Number.parseInt(event.target.value, 10) });
  }

  private readonly _onChangeSaturationMultiplier = (event: React.ChangeEvent<HTMLInputElement>) => {
    effectsConfig.saturation.multiplier = Number(event.target.value);
    this.updateEffectsConfig();
  }

  private updateEffectsConfig(): void {
    this.setState({ effectsConfig });
    if (this.state.viewport)
      this.state.viewport.requestRedraw();
  };

  private readonly _onIModelReady = () => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
      // The lens distortion effect requires the camera to be enabled.
      if (!viewport.isCameraOn)
        viewport.turnCameraOn(Angle.createDegrees(90));

      this.setState({
        viewport,
        activeEffectIndex: 0,
      });
    });
  }

  public componentDidUpdate(_prevProp: UIProps, prevState: UIState) {
    if (this.state.viewport === prevState.viewport && this.state.activeEffectIndex === prevState.activeEffectIndex)
      return;

    if (this.state.viewport) {
      const effectName = this.props.effectNames[this.state.activeEffectIndex];
      if ("None" === effectName)
        this.state.viewport.removeScreenSpaceEffects();
      else
        this.state.viewport.screenSpaceEffects = [effectName];
    }
  }

  private getConfigControls(): React.ReactNode {
    return (
      <>
        <span>Slider</span>
        <input type="range" min="0" max="5" step="0.2" value={this.state.effectsConfig.saturation.multiplier} onChange={this._onChangeSaturationMultiplier}></input>
      </>
    );
  }

  private getControls(): React.ReactNode {
    const options = Object.assign({}, effects.map((x) => x.name));
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Effect:</span>
        <Select value={this.state.activeEffectIndex} onChange={this._onChange} style={{ width: "fit-content" }} options={options} />
        {this.getConfigControls()}
      </div>
    );
  }

  public render() {
    const instructions = "Use the drop-down below to select which effect is applied to the viewport.";
    return (
      <>
        <ControlPane instructions={instructions} iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
