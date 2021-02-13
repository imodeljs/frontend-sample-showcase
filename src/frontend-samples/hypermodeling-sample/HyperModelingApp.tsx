/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { HyperModeling } from "@bentley/hypermodeling-frontend";
import SampleApp from "common/SampleApp";
import * as React from "react";
import HyperModelingUI from "./HyperModelingUI";

export default class HyperModelingApp implements SampleApp {
  public static viewport?: ScreenViewport;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    await HyperModeling.initialize();
    return <HyperModelingUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown(): void {
    const viewport = this.viewport;
    if (viewport) {
      this.viewport = undefined;
      HyperModeling.startOrStop(viewport, false);
    }
  }
}
