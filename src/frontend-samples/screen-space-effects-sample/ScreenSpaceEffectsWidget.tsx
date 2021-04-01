/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Slider, Toggle } from "@bentley/ui-core";
import { cloneEffectsConfig, EffectsConfig } from "./Effects";

export interface ScreenSpaceEffectsWidgetProps {
  saturation: boolean;
  vignette: boolean;
  lensDistortion: boolean;
  effectsConfig: EffectsConfig;
  lensAngle: number;
  handleLensAngleChange: (angle: number) => void;
  handleDistortionSaturationVignette: (lensDistortion: boolean, saturation: boolean, vignette: boolean) => void;
  handleEffectsConfig: (effectsConfig: EffectsConfig) => void;
}

export const ScreenSpaceEffectsWidget: React.FunctionComponent<ScreenSpaceEffectsWidgetProps> = ({ saturation, vignette, lensDistortion, effectsConfig, lensAngle, handleLensAngleChange, handleDistortionSaturationVignette, handleEffectsConfig }) => {
  const [saturationState, setSaturationState] = React.useState<boolean>(saturation);
  const [vignetteState, setVignetteState] = React.useState<boolean>(vignette);
  const [lensDistortionState, setLensDistortionState] = React.useState<boolean>(lensDistortion);
  const [effectsConfigState, setEffectsConfigState] = React.useState<EffectsConfig>(effectsConfig);
  const [lensAngleState, setLensAngleState] = React.useState<number>(lensAngle);

  // Handle Lens angle change
  useEffect(() => {
    handleLensAngleChange(lensAngleState);
  }, [handleLensAngleChange, lensAngleState]);

  // Handle distortion, saturation and vignette
  useEffect(() => {
    handleDistortionSaturationVignette(lensDistortionState, saturationState, vignetteState);
  }, [handleDistortionSaturationVignette, lensDistortionState, saturationState, vignetteState]);

  // Handle EffectsConfigState change
  useEffect(() => {
    handleEffectsConfig(effectsConfigState);

  }, [effectsConfigState, handleEffectsConfig]);

  const _onUpdateLensAngle = (values: readonly number[]) => {
    setLensAngleState(values[0]);
  };

  // Create a slider to adjust one of the properties of `EffectsConfig`.
  const createSlider = (label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    enableIf: "saturation" | "lensDistortion" | "vignette",
    update: (newConfig: EffectsConfig, newValue: number) => void) => {

    const updateValue = (values: readonly number[]) => {
      const config = cloneEffectsConfig(effectsConfigState);
      update(config, values[0]);
      setEffectsConfigState(config);
      return { config };
    };

    let state = false;

    switch (enableIf) {
      case "saturation":
        state = saturationState;
        break;
      case "lensDistortion":
        state = lensDistortionState;
        break;
      case "vignette":
        state = vignetteState;
        break;
    }

    return (
      <>
        <span>{label}</span>
        <Slider min={min} max={max} step={step} values={[value]} onUpdate={updateValue} disabled={!state}></Slider>
      </>
    );
  };

  // When the view is opened, the lens angle can be outside the normal range.  This will leave it unchanged until the user adjusts it.
  const lensAngleMin = 90, lensAngleMax = 160;
  let lensAngleValue = lensAngleState;
  lensAngleValue = Math.min(lensAngleValue, lensAngleMax);
  lensAngleValue = Math.max(lensAngleValue, lensAngleMin);
  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Saturation</span>
        <Toggle isOn={saturationState} onChange={(sat) => setSaturationState(sat)} />
        {createSlider("Multiplier", effectsConfigState.saturation.multiplier, 0, 4, 0.2, "saturation", (config, val) => config.saturation.multiplier = val)}
        <span>Vignette</span>
        <Toggle isOn={vignetteState} onChange={(enableVignette) => setVignetteState(enableVignette)} />
        {createSlider("Size", effectsConfigState.vignette.size, 0, 1, 0.05, "vignette", (config, val) => config.vignette.size = val)}
        {createSlider("Smoothness", effectsConfigState.vignette.smoothness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.smoothness = val)}
        {createSlider("Roundness", effectsConfigState.vignette.roundness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.roundness = val)}
        <span>Lens Distortion</span>
        <Toggle isOn={lensDistortionState} onChange={(lensDist) => setLensDistortionState(lensDist)} />
        <span>Lens Angle</span>
        <Slider showMinMax={true} min={lensAngleMin} max={lensAngleMax} step={5} values={[lensAngleValue]} disabled={!lensDistortionState} onUpdate={_onUpdateLensAngle} />
        {createSlider("Strength", effectsConfigState.lensDistortion.strength, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.strength = val)}
        {createSlider("Cylindrical Ratio", effectsConfigState.lensDistortion.cylindricalRatio, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.cylindricalRatio = val)}
      </div>
    </>
  );
};
