/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1dProps } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ThematicDisplay, ThematicDisplayProps, ThematicGradientColorScheme } from "@bentley/imodeljs-common";
import { Viewport, ViewState3d } from "@bentley/imodeljs-frontend";

/** This file contains the user interface and main logic that is specific to this sample. */
export class ThematicDisplayAPI {
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
  public static getProjectExtents(vp: Viewport): Range1dProps {
    const extents = vp.iModel.projectExtents;
    return { low: extents.zLow, high: extents.zHigh };
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
    const props = ThematicDisplayAPI.getThematicDisplayProps(vp);
    props.range = range;
    this.setThematicDisplayProps(vp, props);
  }

  /** Modify the gradient color scheme setting using the Viewport API. */
  public static setThematicDisplayGradientColorScheme(vp: Viewport, colorScheme: ThematicGradientColorScheme) {
    const props = ThematicDisplayAPI.getThematicDisplayProps(vp);
    if (undefined === props.gradientSettings)
      props.gradientSettings = {};
    props.gradientSettings.colorScheme = colorScheme;
    this.setThematicDisplayProps(vp, props);
  }
}
