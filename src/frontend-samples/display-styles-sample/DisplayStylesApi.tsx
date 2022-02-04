/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { DisplayStyle3dSettingsProps } from "@itwin/core-common";
import { Viewport } from "@itwin/core-frontend";

export default class DisplayStylesApp {
  /** Overrides the current display styles using the viewport API. */
  public static applyDisplayStyle(viewport: Viewport, style: DisplayStyle3dSettingsProps) {
    viewport.overrideDisplayStyle(style);
  }
}
