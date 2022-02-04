/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { GlobeMode, TerrainHeightOriginMode, ThematicDisplay, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@itwin/core-common";
import { IModelConnection, Viewport, ViewState3d } from "@itwin/core-frontend";
import { Range1dProps, Vector3d } from "@itwin/core-geometry";

export default class ThematicDisplayApi {
  /** Render changes to viewport using Viewport API. */
  public static syncViewport(vp: Viewport): void {
    vp.synchWithView();
  }

  /** Tests is the iModel able to be displayed with thematic. */
  public static isThematicDisplaySupported(vp: Viewport): boolean {
    return vp.view.is3d();
  }

  /** Query background map view flag using Viewport API. */
  public static isBackgroundMapOn(vp: Viewport): boolean {
    return vp.viewFlags.backgroundMap;
  }

  /** Query thematic display view flag using Viewport API. */
  public static isThematicDisplayOn(vp: Viewport): boolean {
    return vp.viewFlags.thematicDisplay;
  }

  /** Query if the model has been geo-located using the iModel API. */
  public static isGeoLocated(iModel: IModelConnection): boolean {
    return iModel.isGeoLocated;
  }

  /** Query Thematic Display settings with the Viewport API. */
  public static getThematicDisplayProps(vp: Viewport): ThematicDisplayProps {
    const thematic = (vp.view as ViewState3d).getDisplayStyle3d().settings.thematic;
    return thematic.toJSON();
  }

  /** Query project extents using the Viewport API. */
  public static getProjectExtents(iModel: IModelConnection): Range1dProps {
    const extents = iModel.projectExtents;
    return { low: extents.zLow, high: extents.zHigh };
  }

  /** Modify the background view flag and terrain setting using the Viewport API. */
  public static setBackgroundMap(vp: Viewport, on: boolean) {
    // To best display the capabilities of the thematic display, terrain and plane global mode have been enabled.
    vp.changeBackgroundMapProps({
      applyTerrain: true,
      globeMode: GlobeMode.Plane, // If the user zooms out enough, the curve of the earth can effect the thematic display.
      useDepthBuffer: true,
      transparency: 0.75,
      terrainSettings: { heightOriginMode: TerrainHeightOriginMode.Geoid },
    });
    // vp.backgroundMapSettings = BackgroundMapSettings.fromJSON();
    // vp.synchWithView();
    vp.viewFlags = vp.viewFlags.with("backgroundMap", on);
  }

  /** Modify the thematic display view flag using the Viewport API. */
  public static setThematicDisplayOnOff(vp: Viewport, on: boolean) {
    vp.viewFlags = vp.viewFlags.with("thematicDisplay", on);
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

  /** Modify the display mode setting using the Viewport API. */
  public static setThematicDisplayMode(vp: Viewport, displayMode: ThematicDisplayMode) {
    const props = this.getThematicDisplayProps(vp);
    props.displayMode = displayMode;
    this.setThematicDisplayProps(vp, props);
  }

  public static setThematicDisplaySunDirection(vp: Viewport, sunDirection: Vector3d) {
    const props = this.getThematicDisplayProps(vp);
    props.sunDirection = sunDirection;
    this.setThematicDisplayProps(vp, props);
  }

  /** Modify the gradient mode setting using the Viewport API. */
  public static setThematicDisplayGradientMode(vp: Viewport, gradientMode: ThematicGradientMode) {
    const props = this.getThematicDisplayProps(vp);
    if (undefined === props.gradientSettings)
      props.gradientSettings = {};
    props.gradientSettings.mode = gradientMode;
    this.setThematicDisplayProps(vp, props);
  }
}
