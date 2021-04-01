/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelApp, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { ScreenSpaceEffectsWidget } from "./ScreenSpaceEffectsWidget";
import { UiItemsProvider } from "@bentley/ui-abstract";
import ScreenSpaceEffectsApp from "./ScreenSpaceEffectsApp";
import { EffectsConfig, getCurrentEffectsConfig, updateEffectsConfig } from "./Effects";
import { Angle } from "@bentley/geometry-core";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

interface ScreenSpaceEffectsUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
  viewState?: ViewState;
  saturation: boolean;
  vignette: boolean;
  lensDistortion: boolean;
  effectsConfig: EffectsConfig;
  lensAngle: number;
}

export default class ScreenSpaceEffectsUI extends React.Component<{}, ScreenSpaceEffectsUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      saturation: true,
      vignette: true,
      lensDistortion: true,
      effectsConfig: getCurrentEffectsConfig(),
      lensAngle: 90,
    };
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the toggles below to select which effects are applied to the viewport.",
      this._getScreenSpaceEffectsWidget(),
      this.setState.bind(this),
      [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House]
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _getScreenSpaceEffectsWidget = () => {
    return <ScreenSpaceEffectsWidget
      saturation={this.state.saturation}
      vignette={this.state.vignette}
      lensDistortion={this.state.lensDistortion}
      effectsConfig={this.state.effectsConfig}
      lensAngle={this.state.lensAngle}
      handleLensAngleChange={this._handleLensAngleChange}
      handleDistortionSaturationVignette={this._handleDistortionSaturationVignette}
      handleEffectsConfig={this._handleEffectsConfig} />
  };

  private _handleLensAngleChange = (angle: number) => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    viewport.turnCameraOn(Angle.createDegrees(angle));

    // ###TODO turnCameraOn is supposed to do this, but currently doesn't. Remove once that is fixed.
    viewport.invalidateRenderPlan();

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();
  };

  private _handleDistortionSaturationVignette = (lensDistortion: boolean, saturation: boolean, vignette: boolean) => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    // Screen-space effects are applied in the order in which they are added to the viewport.
    // Lens distortion shifts pixels, so we want to apply that first, then saturate, and finally vignette.
    viewport.removeScreenSpaceEffects();
    if (lensDistortion)
      viewport.addScreenSpaceEffect("Lens Distortion");

    if (saturation)
      viewport.addScreenSpaceEffect("Saturation");

    if (vignette)
      viewport.addScreenSpaceEffect("Vignette");

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();
  };

  private _handleEffectsConfig = (effectsConfig: EffectsConfig) => {
    const viewport = IModelApp.viewManager.selectedView;
    if (!viewport)
      return;

    updateEffectsConfig(effectsConfig);

    viewport.requestRedraw();

    // ###TODO requestRedraw is supposed to do this, but currently doesn't. Remove once that is fixed.
    IModelApp.requestNextAnimation();
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {

    IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
      viewport.removeScreenSpaceEffects();
      ScreenSpaceEffectsApp.registerEffects();

      // The lens distortion effect requires the camera to be enabled. Turn it on if it's not already.
      let lensAngle = this.state.lensAngle;
      if (!viewport.view.isCameraEnabled())
        viewport.turnCameraOn(Angle.createDegrees(lensAngle));
      else
        lensAngle = viewport.view.camera.getLensAngle().degrees;

      // The grid is distracting and not useful in read-only apps.
      viewport.viewFlags.grid = false;

      this.setState({ lensAngle });
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ viewportOptions: { viewState } });
      });

  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={this._uiProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
