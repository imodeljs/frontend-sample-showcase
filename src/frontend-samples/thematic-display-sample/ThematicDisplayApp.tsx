/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ThematicDisplayProps } from "@bentley/imodeljs-common";
import { Viewport } from "@bentley/imodeljs-frontend";
import * as React from "react";
import { ThematicDisplayAPI } from "./ThematicDisplayAPI";
import ThematicDisplaySampleUI from "./ThematicDisplayUI";

// cSpell:ignore imodels

/** Handles the setup and teardown of the thematic display sample */
export default class ThematicDisplaySampleApp {
  public static originalProps?: ThematicDisplayProps;
  public static originalFlag: boolean = false;
  public static viewport?: Viewport;

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    return <ThematicDisplaySampleUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    if (undefined === this.viewport) return;
    ThematicDisplayAPI.setThematicDisplayProps(this.viewport, this.originalProps);
    ThematicDisplayAPI.setThematicDisplayOnOff(this.viewport, this.originalFlag);
  }
}
