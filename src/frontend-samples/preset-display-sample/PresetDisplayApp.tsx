/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DisplayStyle3dSettingsProps } from "@bentley/imodeljs-common";
import { Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import PresetDisplayUI from "./PresetDisplayUI";
import { renderingStyles } from "./Styles";

/** This sample highlights the ability to override the current display settings with a JObject
 * or JSON describing the desired settings. All the descriptions are in the Styles.ts file.
 *
 * We invite you to create your own settings using the "Custom" tag provided.
 * You can copy and paste parts of your favorite styles as a start.
 */

export default class PresetDisplayApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <PresetDisplayUI renderingStyles={renderingStyles} iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Overrides the current display styles using the viewport API. */
  public static setPresetRenderingStyle(viewport: Viewport, style: DisplayStyle3dSettingsProps) {
    viewport.overrideDisplayStyle(style);
  }
}
