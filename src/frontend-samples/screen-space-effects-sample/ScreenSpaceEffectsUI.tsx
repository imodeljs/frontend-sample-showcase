/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle } from "@bentley/geometry-core";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import { Slider, Toggle } from "@bentley/ui-core";
import { cloneEffectsConfig, EffectsConfig, equalEffectsConfigs, getCurrentEffectsConfig, updateEffectsConfig } from "./Effects";
import ScreenSpaceEffectsApp from "./ScreenSpaceEffectsApp";

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
    enableLensDistortion: true,
    enableVignette: true,
    enableSaturation: true,
    effectsConfig: getCurrentEffectsConfig(),
    lensAngle: 90,
  };

  public componentDidMount() {
    // We need to register the effects once, after IModelApp.startup is invoked.
    if (!ScreenSpaceEffectsApp._effectsRegistered) {
      ScreenSpaceEffectsApp.registerEffects();
      ScreenSpaceEffectsApp._effectsRegistered = true;
    }
  }

  // Create a slider to adjust one of the properties of `EffectsConfig`.
  private createSlider(label: string, value: number, min: number, max: number, step: number, enableIf: "enableSaturation" | "enableLensDistortion" | "enableVignette",
    update: (newConfig: EffectsConfig, newValue: number) => void) {
    const updateValue = (values: readonly number[]) => {
      this.setState((prev) => {
        const effectsConfig = cloneEffectsConfig(prev.effectsConfig);
        update(effectsConfig, values[0]);
        return { effectsConfig };
      });
    };

    return (
      <>
        <span>{label}</span>
        <Slider min={min} max={max} step={step} values={[value]} onUpdate={updateValue} disabled={!this.state[enableIf]}></Slider>
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
  };

  private readonly _onUpdateLensAngle = (values: readonly number[]) => {
    this.setState({ lensAngle: values[0] });
  };

  public componentDidUpdate(_prevProp: UIProps, prevState: UIState) {
    const viewport = this.state.viewport;
    if (!viewport)
      return;

    // Was a new iModel opened?
    const newViewport = this.state.viewport?.viewportId !== prevState.viewport?.viewportId;

    let changed = false;
    if (this.state.lensAngle !== prevState.lensAngle) {
      changed = true;
      viewport.turnCameraOn(Angle.createDegrees(this.state.lensAngle));

      // ###TODO turnCameraOn is supposed to do this, but currently doesn't. Remove once that is fixed.
      viewport.invalidateRenderPlan();
    }

    // Was an effect toggled on or off?
    if (newViewport || this.state.enableSaturation !== prevState.enableSaturation || this.state.enableVignette !== prevState.enableVignette || this.state.enableLensDistortion !== prevState.enableLensDistortion) {
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

    // Were the settings controlling the effects changed?
    if (!equalEffectsConfigs(this.state.effectsConfig, prevState.effectsConfig)) {
      changed = true;
      updateEffectsConfig(this.state.effectsConfig);
    }

    if (changed) {
      viewport.requestRedraw();

      // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
      IModelApp.requestNextAnimation();
    }
  }

  private getControls(): React.ReactNode {
    // When the view is opened, the lens angle can be outside the normal range.  This will leave it unchanged until the user adjusts it.
    const lensAngleMin = 90, lensAngleMax = 160;
    let lensAngleValue = this.state.lensAngle;
    lensAngleValue = Math.min(lensAngleValue, lensAngleMax);
    lensAngleValue = Math.max(lensAngleValue, lensAngleMin);

    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Saturation</span>
        <Toggle isOn={this.state.enableSaturation} onChange={(enableSaturation) => this.setState({ enableSaturation })} />
        {this.createSlider("Multiplier", this.state.effectsConfig.saturation.multiplier, 0, 4, 0.2, "enableSaturation", (config, val) => config.saturation.multiplier = val)}
        <span>Vignette</span>
        <Toggle isOn={this.state.enableVignette} onChange={(enableVignette) => this.setState({ enableVignette })} />
        {this.createSlider("Size", this.state.effectsConfig.vignette.size, 0, 1, 0.05, "enableVignette", (config, val) => config.vignette.size = val)}
        {this.createSlider("Smoothness", this.state.effectsConfig.vignette.smoothness, 0, 1, 0.05, "enableVignette", (config, val) => config.vignette.smoothness = val)}
        {this.createSlider("Roundness", this.state.effectsConfig.vignette.roundness, 0, 1, 0.05, "enableVignette", (config, val) => config.vignette.roundness = val)}
        <span>Lens Distortion</span>
        <Toggle isOn={this.state.enableLensDistortion} onChange={(enableLensDistortion) => this.setState({ enableLensDistortion })} />
        <span>Lens Angle</span>
        <Slider showMinMax={true} min={lensAngleMin} max={lensAngleMax} step={5} values={[lensAngleValue]} disabled={!this.state.enableLensDistortion} onUpdate={this._onUpdateLensAngle} />
        {this.createSlider("Strength", this.state.effectsConfig.lensDistortion.strength, 0, 1, 0.05, "enableLensDistortion", (config, val) => config.lensDistortion.strength = val)}
        {this.createSlider("Cylindrical Ratio", this.state.effectsConfig.lensDistortion.cylindricalRatio, 0, 1, 0.05, "enableLensDistortion", (config, val) => config.lensDistortion.cylindricalRatio = val)}
      </div>
    );
  }

  public render() {
    const instructions = "Use the toggles below to select which effects are applied to the viewport.";
    return (
      <>
        <ControlPane instructions={instructions} iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        <SandboxViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
