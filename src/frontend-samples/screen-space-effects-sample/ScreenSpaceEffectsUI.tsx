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
import { Slider, Toggle } from "@bentley/ui-core";
import { EffectsConfig, effectsConfig } from "./Effects";

interface UIState {
  enableSaturation: boolean;
  enableVignette: boolean;
  enableLensDistortion: boolean;
  viewport?: ScreenViewport;
  effectsConfig: EffectsConfig;
  // Lens angle of the viewport's camera.
  lensAngle: number;
}

interface UIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export default class ScreenSpaceEffectsUI extends React.Component<UIProps, UIState> {
  public state: UIState = {
    enableSaturation: false,
    enableVignette: false,
    enableLensDistortion: false,
    effectsConfig,
    lensAngle: 90,
  };

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
    const viewport = this.state.viewport;
    if (!viewport)
      return;

    let changed = false;
    if (this.state.lensAngle !== prevState.lensAngle) {
      changed = true;
      viewport.turnCameraOn(Angle.createDegrees(this.state.lensAngle));
    }

    if (this.state.enableSaturation !== prevState.enableSaturation || this.state.enableVignette !== prevState.enableVignette || this.state.enableLensDistortion !== prevState.enableLensDistortion) {
      changed = true;

      // Screen-space effects are applied in the order in which they are added to the viewport.
      // Lens distortion shifts pixels, so we want to apply that first, then saturate, and finally vignette.
      viewport.removeScreenSpaceEffects();
      if (this.state.enableLensDistortion)
        viewport.addScreenSpaceEffect("Lens Distortion");

      if (this.state.enableSaturation)
        viewport.addScreenSpaceEffect("Saturation");

      if (this.state.enableVignette)
        viewport.addScreenSpaceEffect("Vignette");
    }

    // ###TODO check if effectsConfig changed. Sync with the const effectsConfig.
    if (changed) {
      viewport.requestRedraw();

      // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
      IModelApp.requestNextAnimation();
    }
  }

  /*
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
  */

  private getControls(): React.ReactNode {
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Saturation</span>
        <Toggle isOn={this.state.enableSaturation} onChange={(enableSaturation) => this.setState({ enableSaturation })} />
        <span>Vignette</span>
        <Toggle isOn={this.state.enableVignette} onChange={(enableVignette) => this.setState({ enableVignette })} />
        <span>Lens Distortion</span>
        <Toggle isOn={this.state.enableLensDistortion} onChange={(enableLensDistortion) => this.setState({ enableLensDistortion })} />
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
