/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Slider, Toggle } from "@bentley/ui-core";
import ScreenSpaceEffectsApp from "./ScreenSpaceEffectsApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { cloneEffectsConfig, EffectsConfig, getCurrentEffectsConfig, updateEffectsConfig } from "./Effects";
import { Angle } from "@bentley/geometry-core";

export const ScreenSpaceEffectsWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [saturationState, setSaturationState] = React.useState<boolean>(true);
  const [vignetteState, setVignetteState] = React.useState<boolean>(true);
  const [lensDistortionState, setLensDistortionState] = React.useState<boolean>(true);
  const [effectsConfigState, setEffectsConfigState] = React.useState<EffectsConfig>(getCurrentEffectsConfig());
  const [lensAngleState, setLensAngleState] = React.useState<number>(90);

  // Only runs once because of the empty array passed as dependency [], similar to componentDidMount
  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (!vp)
        return;

      // Need to remove the screenSpaceEffects if there are any already loaded
      vp.removeScreenSpaceEffects();
      ScreenSpaceEffectsApp.registerEffects();

      IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
        // The lens distortion effect requires the camera to be enabled. Turn it on if it's not already.
        let lensAngle = lensAngleState;
        if (!viewport.view.isCameraEnabled())
          viewport.turnCameraOn(Angle.createDegrees(lensAngle));
        else
          lensAngle = viewport.view.camera.getLensAngle().degrees;

        // The grid is distracting and not useful in read-only apps.
        viewport.viewFlags.grid = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Lens angle change
  useEffect(() => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    viewport.turnCameraOn(Angle.createDegrees(lensAngleState));

    // ###TODO turnCameraOn is supposed to do this, but currently doesn't. Remove once that is fixed.
    viewport.invalidateRenderPlan();

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();
  }, [lensAngleState]);

  // Screen-space effects are applied in the order in which they are added to the viewport.
  // Lens distortion shifts pixels, so we want to apply that first, then saturate, and finally vignette.
  useEffect(() => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    // Screen-space effects are applied in the order in which they are added to the viewport.
    // Lens distortion shifts pixels, so we want to apply that first, then saturate, and finally vignette.
    viewport.removeScreenSpaceEffects();
    if (lensDistortionState)
      viewport.addScreenSpaceEffect("Lens Distortion");

    if (saturationState)
      viewport.addScreenSpaceEffect("Saturation");

    if (vignetteState)
      viewport.addScreenSpaceEffect("Vignette");

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();

  }, [lensDistortionState, saturationState, vignetteState]);

  // Handle EffectsConfigState change
  useEffect(() => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    updateEffectsConfig(effectsConfigState);

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();

  }, [effectsConfigState]);

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
      const effectsConfig = cloneEffectsConfig(effectsConfigState);
      update(effectsConfig, values[0]);
      setEffectsConfigState(effectsConfig);
      return { effectsConfig };
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
        <Toggle isOn={saturationState} onChange={(saturation) => setSaturationState(saturation)} />
        {createSlider("Multiplier", effectsConfigState.saturation.multiplier, 0, 4, 0.2, "saturation", (config, val) => config.saturation.multiplier = val)}
        <span>Vignette</span>
        <Toggle isOn={vignetteState} onChange={(enableVignette) => setVignetteState(enableVignette)} />
        {createSlider("Size", effectsConfigState.vignette.size, 0, 1, 0.05, "vignette", (config, val) => config.vignette.size = val)}
        {createSlider("Smoothness", effectsConfigState.vignette.smoothness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.smoothness = val)}
        {createSlider("Roundness", effectsConfigState.vignette.roundness, 0, 1, 0.05, "vignette", (config, val) => config.vignette.roundness = val)}
        <span>Lens Distortion</span>
        <Toggle isOn={lensDistortionState} onChange={(lensDistortion) => setLensDistortionState(lensDistortion)} />
        <span>Lens Angle</span>
        <Slider showMinMax={true} min={lensAngleMin} max={lensAngleMax} step={5} values={[lensAngleValue]} disabled={!lensDistortionState} onUpdate={_onUpdateLensAngle} />
        {createSlider("Strength", effectsConfigState.lensDistortion.strength, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.strength = val)}
        {createSlider("Cylindrical Ratio", effectsConfigState.lensDistortion.cylindricalRatio, 0, 1, 0.05, "lensDistortion", (config, val) => config.lensDistortion.cylindricalRatio = val)}
      </div>
    </>
  );
};
