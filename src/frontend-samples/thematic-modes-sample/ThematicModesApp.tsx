/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1d, Range1dProps, Range3d } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ThematicDisplay, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@bentley/imodeljs-common";
import { IModelApp, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { PlacementTool } from "common/PlacementTool";
import SampleApp from "common/SampleApp";
import * as React from "react";
import ThematicModesUI from "./ThematicModesUI";

// cSpell:ignore imodels

/** Handles the setup and teardown of the thematic display sample */
export default class ThematicModesApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;
  public static originalProps?: ThematicDisplayProps;
  public static originalFlag: boolean = false;
  public static viewport?: Viewport;

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("marker-pin-i18n-namespace");

    PlacementTool.register(this._sampleNamespace);
    return <ThematicModesUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    IModelApp.i18n.unregisterNamespace("marker-pin-i18n-namespace");
    IModelApp.tools.unRegister(PlacementTool.toolId);
    if (undefined === this.viewport) return;
    this.setThematicDisplayProps(this.viewport, this.originalProps);
    this.setThematicDisplayOnOff(this.viewport, this.originalFlag);
  }

  /** Render changes to viewport using Viewport API. */
  public static syncViewport(vp: Viewport): void {
    vp.synchWithView();
  }

  /** Tests is the iModel able to be displayed with thematic. */
  public static isThematicDisplaySupported(vp: Viewport): boolean {
    return vp.view.is3d();
  }

  /** Query view flags using Viewport API. */
  public static isThematicDisplayOn(vp: Viewport): boolean {
    return vp.viewFlags.thematicDisplay;
  }

  /** Query Thematic Display settings with the Viewport API. */
  public static getThematicDisplayProps(vp: Viewport): ThematicDisplayProps {
    const thematic = (vp.view as ViewState3d).getDisplayStyle3d().settings.thematic;
    return thematic.toJSON();
  }

  /** Query project extents using the Viewport API. */
  public static getProjectExtents(vp: Viewport): Range3d {
    // const extents = vp.iModel.projectExtents;
    const range = Range3d.fromJSON({
      low: {
        x: 512632.32219023904,
        y: 6654306.092700552,
        z: -4.808883666992187,
      },
      high: {
        x: 505922.32219023904,
        y: 6644766.092700552,
        z: 127.30888366699219,
      },
    });
    return range;
  }

  /** Modify the view flags using the Viewport API. */
  public static setThematicDisplayOnOff(vp: Viewport, on: boolean) {
    const vf = vp.viewFlags.clone();
    vf.thematicDisplay = on;
    vp.viewFlags = vf;
  }

  /** Overwrite the settings using the Viewport API.  Any props not set will be set to default value by iModel.js.
   * Note: changes to the settings will not be seen until the view is updated.  Use the 'syncViewport' method to do this.
   * While it would be simplest to call syncViewport here, I will be calling it in the controls to optimize setting multiple props.
   */
  public static setThematicDisplayProps(vp: Viewport, props?: ThematicDisplayProps): void {
    const displaySettings = (vp.view as ViewState3d).getDisplayStyle3d().settings;
    displaySettings.thematic = ThematicDisplay.fromJSON(props);
  }

  // All API below here are modifying specific props and use the API.setThematicProps(...) method.

  /** Modify the range setting using the Viewport API. */
  public static setThematicDisplayRange(vp: Viewport, range: Range1dProps) {
    const props = this.getThematicDisplayProps(vp);
    props.range = range;
    this.setThematicDisplayProps(vp, props);
  }

  /** Modify the gradient color scheme setting using the Viewport API. */
  public static setThematicDisplayGradientColorScheme(vp: Viewport, colorScheme: ThematicGradientColorScheme) {
    const props = this.getThematicDisplayProps(vp);
    if (undefined === props.gradientSettings)
      props.gradientSettings = {};
    props.gradientSettings.colorScheme = colorScheme;
    this.setThematicDisplayProps(vp, props);
  }

  public static setThematicDisplayMode(vp: Viewport, displayMode: ThematicDisplayMode) {
    const props = this.getThematicDisplayProps(vp);
    props.displayMode = displayMode;
    this.setThematicDisplayProps(vp, props);
  }

  public static setThematicDisplayGradientMode(vp: Viewport, gradientMode: ThematicGradientMode) {
    const props = this.getThematicDisplayProps(vp);
    if (undefined === props.gradientSettings)
      props.gradientSettings = {};
    props.gradientSettings.mode = gradientMode;
    this.setThematicDisplayProps(vp, props);
  }
}
