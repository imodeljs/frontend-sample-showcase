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
import { Select, Slider } from "@bentley/ui-core";
import { effects, EffectsConfig, effectsConfig } from "./Effects";

interface UIState {
  // Index of the selected effect.
  activeEffectIndex: number;
  viewport?: ScreenViewport;
  effectsConfig: EffectsConfig;
  // Lens angle of the viewport's camera.
  lensAngle: number;
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
    lensAngle: 90,
  };

  private readonly _onChangeActiveEffect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ activeEffectIndex: Number.parseInt(event.target.value, 10) });
  }

  // Create a slider to adjust one of the properties of `EffectsConfig`.
  private createSlider(label: string, value: number, min: number, max: number, step: number, update: (newValue: number) => void) {
    const updateValue = (values: readonly number[]) => {
      update(Number(values[0]));
      this.setState({ effectsConfig });

      // Ask the viewport to redraw its contents so that the changes to the effect are immediately visible.
      if (this.state.viewport)
        this.state.viewport.requestRedraw();
    };

    return (
      <>
        <span>{label}</span>
        <Slider min={min} max={max} step={step} values={[value]} onUpdate={updateValue}></Slider>
      </>
    );
  }

  private readonly _onIModelReady = () => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
      // The lens distortion effect requires the camera to be enabled. Turn it on if it's not already.
      let lensAngle = this.state.lensAngle;
      if (!viewport.view.isCameraEnabled())
        viewport.turnCameraOn(Angle.createDegrees(lensAngle));
      else
        lensAngle = viewport.view.camera.getLensAngle().degrees;

      // The grid is distracting and not useful in read-only apps.
      viewport.viewFlags.grid = false;

      this.setState({
        viewport,
        activeEffectIndex: 0,
        lensAngle,
      });
    });
  }

  private readonly _onChangeLensAngle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const lensAngle = Number(event.target.value);
    this.setState({ lensAngle });

    if (this.state.viewport) {
      this.state.viewport.turnCameraOn(Angle.createDegrees(lensAngle));
      this.state.viewport.requestRedraw();
    }
  }

  public componentDidUpdate(_prevProp: UIProps, prevState: UIState) {
    if (this.state.viewport === prevState.viewport && this.state.activeEffectIndex === prevState.activeEffectIndex)
      return;

    if (this.state.viewport) {
      const effectName = this.props.effectNames[this.state.activeEffectIndex];
      this.state.viewport.removeScreenSpaceEffects();
      if ("None" !== effectName)
        this.state.viewport.addScreenSpaceEffect(effectName);
    }
  }

  // Create sliders to adjust the settings affecting the active effect.
  private getConfigControls(): React.ReactNode {
    switch (this.props.effectNames[this.state.activeEffectIndex]) {
      case "Saturation":
        return (
          <>
            {this.createSlider("Multiplier", this.state.effectsConfig.saturation.multiplier, 0, 5, 0.2, (val) => effectsConfig.saturation.multiplier = val)}
          </>
        );
      case "Vignette":
        return (
          <>
            {this.createSlider("Size", this.state.effectsConfig.vignette.size, 0, 1, 0.05, (val) => effectsConfig.vignette.size = val)}
            {this.createSlider("Smoothness", this.state.effectsConfig.vignette.smoothness, 0, 1, 0.05, (val) => effectsConfig.vignette.smoothness = val)}
            {this.createSlider("Roundness", this.state.effectsConfig.vignette.roundness, 0, 1, 0.05, (val) => effectsConfig.vignette.roundness = val)}
          </>
        );
      case "Lens Distortion":
        return (
          <>
            {this.createSlider("Strength", this.state.effectsConfig.lensDistortion.strength, 0, 1, 0.05, (val) => effectsConfig.lensDistortion.strength = val)}
            {this.createSlider("Cylindrical Ratio", this.state.effectsConfig.lensDistortion.cylindricalRatio, 0, 1, 0.05, (val) => effectsConfig.lensDistortion.cylindricalRatio = val)}
            <span>Lens Angle</span>
            <input type="range" min="90" max="160" step="5" value={this.state.lensAngle} onInput={this._onChangeLensAngle}></input>
          </>
        );
      default:
        return (
          <>
          </>
        );
    }
  }

  private getControls(): React.ReactNode {
    const options = Object.assign({}, effects.map((x) => x.name));
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Effect:</span>
        <Select value={this.state.activeEffectIndex} onChange={this._onChangeActiveEffect} style={{ width: "fit-content" }} options={options} />
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
