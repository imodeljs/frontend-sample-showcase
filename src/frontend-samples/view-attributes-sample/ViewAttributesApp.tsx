/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { Environment, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { RenderMode } from "@bentley/imodeljs-common";
import ViewAttributesUI from "./ViewAttributesUI";

// cSpell:ignore imodels

export enum ViewFlag {
  ACS, Grid, HiddenEdges, Monochrome, VisibleEdges, Shadows,
}

export interface AttrValues {
  renderMode: RenderMode;
  acs: boolean;
  cameraOn: boolean;
  grid: boolean;
  hiddenEdges: boolean;
  monochrome: boolean;
  shadows: boolean;
  skybox: boolean;
  visibleEdges: boolean;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class ViewAttributesApp {

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ViewAttributesUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static getAttrValues(vp: Viewport): AttrValues {
    return {
      renderMode: ViewAttributesApp.getRenderModel(vp),
      acs: ViewAttributesApp.getViewFlag(vp, ViewFlag.ACS),
      cameraOn: ViewAttributesApp.isCameraOn(vp),
      grid: ViewAttributesApp.getViewFlag(vp, ViewFlag.Grid),
      hiddenEdges: ViewAttributesApp.getViewFlag(vp, ViewFlag.HiddenEdges),
      monochrome: ViewAttributesApp.getViewFlag(vp, ViewFlag.Monochrome),
      shadows: ViewAttributesApp.getViewFlag(vp, ViewFlag.Shadows),
      skybox: ViewAttributesApp.isSkyboxOn(vp),
      visibleEdges: ViewAttributesApp.getViewFlag(vp, ViewFlag.VisibleEdges),
    };
  }

  // Query flag values using the Viewport API.
  public static getViewFlag(vp: Viewport, flag: ViewFlag): boolean {
    switch (flag) {
      case ViewFlag.ACS: return vp.viewFlags.acsTriad;
      case ViewFlag.Grid: return vp.viewFlags.grid;
      case ViewFlag.HiddenEdges: return vp.viewFlags.hiddenEdges;
      case ViewFlag.Monochrome: return vp.viewFlags.monochrome;
      case ViewFlag.Shadows: return vp.viewFlags.shadows;
      case ViewFlag.VisibleEdges: return vp.viewFlags.visibleEdges;
    }

    return false;
  }

  // Modify flag values using the Viewport API.
  public static setViewFlag(vp: Viewport, flag: ViewFlag, on: boolean) {
    const viewFlags = vp.viewFlags.clone();

    switch (flag) {
      case ViewFlag.ACS:
        viewFlags.acsTriad = on;
        break;
      case ViewFlag.Grid:
        viewFlags.grid = on;
        break;
      case ViewFlag.HiddenEdges:
        viewFlags.hiddenEdges = on;
        break;
      case ViewFlag.Monochrome:
        viewFlags.monochrome = on;
        break;
      case ViewFlag.Shadows:
        viewFlags.shadows = on;
        break;
      case ViewFlag.VisibleEdges:
        viewFlags.visibleEdges = on;
        break;
    }

    vp.viewFlags = viewFlags;
  }

  // Query camera setting using the Viewport API.
  public static isCameraOn(vp: Viewport) {
    return vp.isCameraOn;
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
      vp.invalidateRenderPlan();
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
