/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import PresetDisplayUI from "./PresetDisplayUI";
import { DisplayStyle3dSettingsProps } from "@bentley/imodeljs-common";
import { Viewport } from "@bentley/imodeljs-frontend";

export default class PresetDisplayAPP implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <PresetDisplayUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static setPreset(viewport: Viewport, style: DisplayStyle3dSettingsProps) {
    viewport.overrideDisplayStyle(style);
  }
}
