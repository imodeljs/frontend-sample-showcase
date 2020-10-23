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
import DisplayStylesUI from "./DisplayStylesUI";
import { displayStyles } from "./Styles";

export default class DisplayStylesApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <DisplayStylesUI displayStyles={displayStyles} iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Overrides the current display styles using the viewport API. */
  public static applyDisplayStyle(viewport: Viewport, style: DisplayStyle3dSettingsProps) {
    viewport.overrideDisplayStyle(style);
  }
}
