/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Environment, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { RenderMode } from "@bentley/imodeljs-common";

// cSpell:ignore imodels

export enum ViewFlag {
  ACS, BackgroundMap, Grid, HiddenEdges, Monochrome, VisibleEdges, Shadows,
}

export interface AttrValues {
  renderMode: RenderMode;
  acs: boolean;
  backgroundMap: boolean;
  backgroundTransparency: number | false;
  cameraOn: boolean;
  grid: boolean;
  hiddenEdges: boolean;
  monochrome: boolean;
  shadows: boolean;
  skybox: boolean;
  visibleEdges: boolean;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export class ViewAttributesApi {

  public static settings: AttrValues = {
    renderMode: RenderMode.SmoothShade,
    acs: false,
    backgroundMap: true,
    backgroundTransparency: 0.01,
    cameraOn: true,
    grid: false,
    hiddenEdges: false,
    monochrome: false,
    shadows: false,
    skybox: true,
    visibleEdges: false,
  };

  public static getAttrValues(vp: Viewport): AttrValues {
    return {
      renderMode: ViewAttributesApi.getRenderModel(vp),
      acs: ViewAttributesApi.getViewFlag(vp, ViewFlag.ACS),
      backgroundMap: ViewAttributesApi.getViewFlag(vp, ViewFlag.BackgroundMap),
      backgroundTransparency: ViewAttributesApi.getBackgroundTransparency(vp),
      cameraOn: ViewAttributesApi.isCameraOn(vp),
      grid: ViewAttributesApi.getViewFlag(vp, ViewFlag.Grid),
      hiddenEdges: ViewAttributesApi.getViewFlag(vp, ViewFlag.HiddenEdges),
      monochrome: ViewAttributesApi.getViewFlag(vp, ViewFlag.Monochrome),
      shadows: ViewAttributesApi.getViewFlag(vp, ViewFlag.Shadows),
      skybox: ViewAttributesApi.isSkyboxOn(vp),
      visibleEdges: ViewAttributesApi.getViewFlag(vp, ViewFlag.VisibleEdges),
    };
  }

  public static setAttrValues(vp: Viewport, attrValues: AttrValues) {
    const currAttrValues = this.getAttrValues(vp);

    if (currAttrValues.renderMode !== attrValues.renderMode)
      ViewAttributesApi.setRenderMode(vp, attrValues.renderMode);
    if (attrValues.backgroundTransparency && currAttrValues.backgroundTransparency !== attrValues.backgroundTransparency)
      ViewAttributesApi.setBackgroundTransparency(vp, attrValues.backgroundTransparency);
    if (currAttrValues.cameraOn !== attrValues.cameraOn)
      ViewAttributesApi.setCameraOnOff(vp, attrValues.cameraOn);
    if (currAttrValues.skybox !== attrValues.skybox)
      ViewAttributesApi.setSkyboxOnOff(vp, attrValues.skybox);

    // Update viewflags
    vp.viewFlags.acsTriad = attrValues.acs;
    vp.viewFlags.backgroundMap = attrValues.backgroundMap;
    vp.viewFlags.grid = attrValues.grid;
    vp.viewFlags.hiddenEdges = attrValues.hiddenEdges;
    vp.viewFlags.monochrome = attrValues.monochrome;
    vp.viewFlags.shadows = attrValues.shadows;
    vp.viewFlags.visibleEdges = attrValues.visibleEdges;

    vp.synchWithView();
  }

  // Query flag values using the Viewport API.
  public static getViewFlag(vp: Viewport, flag: ViewFlag): boolean {
    switch (flag) {
      case ViewFlag.ACS: return vp.viewFlags.acsTriad;
      case ViewFlag.BackgroundMap: return vp.viewFlags.backgroundMap;
      case ViewFlag.Grid: return vp.viewFlags.grid;
      case ViewFlag.HiddenEdges: return vp.viewFlags.hiddenEdges;
      case ViewFlag.Monochrome: return vp.viewFlags.monochrome;
      case ViewFlag.Shadows: return vp.viewFlags.shadows;
      case ViewFlag.VisibleEdges: return vp.viewFlags.visibleEdges;
    }
  }

  // Modify flag values using the Viewport API.
  public static setViewFlag(vp: Viewport, flag: ViewFlag, on: boolean) {
    switch (flag) {
      case ViewFlag.ACS:
        vp.viewFlags.acsTriad = on;
        break;
      case ViewFlag.BackgroundMap:
        vp.viewFlags.backgroundMap = on;
        break;
      case ViewFlag.Grid:
        vp.viewFlags.grid = on;
        break;
      case ViewFlag.HiddenEdges:
        vp.viewFlags.hiddenEdges = on;
        break;
      case ViewFlag.Monochrome:
        vp.viewFlags.monochrome = on;
        break;
      case ViewFlag.Shadows:
        vp.viewFlags.shadows = on;
        break;
      case ViewFlag.VisibleEdges:
        vp.viewFlags.visibleEdges = on;
        break;
    }
    vp.synchWithView();
  }

  // Query camera setting using the Viewport API.
  public static isCameraOn(vp: Viewport) {
    return vp.isCameraOn;
  }

  // Query map background transparency using the Viewport API
  public static getBackgroundTransparency(vp: Viewport) {
    return vp.backgroundMapSettings.transparency;
  }

  // Modify map background transparency using the Viewport API
  public static setBackgroundTransparency(vp: Viewport, transparency: number) {
    const style = vp.backgroundMapSettings.clone({ transparency });
    vp.displayStyle.backgroundMapSettings = style;
    vp.synchWithView();
  }

  // Modify camera setting using the Viewport API.
  public static setCameraOnOff(vp: Viewport, on: boolean) {
    if (on)
      vp.turnCameraOn();
    else
      (vp.view as ViewState3d).turnCameraOff();

    vp.synchWithView();
  }

  // Query skybox setting using the Viewport API.
  public static isSkyboxOn(vp: Viewport) {
    if (vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();
      return displayStyle.environment.sky.display;
    }

    return false;
  }

  // Modify skybox setting using the Viewport API.
  public static setSkyboxOnOff(vp: Viewport, on: boolean) {
    if (vp.view.is3d()) {
      const style = vp.view.getDisplayStyle3d();
      style.environment = new Environment({ sky: { display: on } });
    }
  }

  // Query render model setting using the Viewport API.
  public static getRenderModel(vp: Viewport): RenderMode {
    return vp.viewFlags.renderMode;
  }

  // Modify render mode setting using the Viewport API.
  public static setRenderMode(vp: Viewport, mode: RenderMode) {
    const viewFlags = vp.viewFlags.clone();
    viewFlags.renderMode = mode;
    vp.viewFlags = viewFlags;
  }

}
