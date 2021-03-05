/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { HyperModeling } from "@bentley/hypermodeling-frontend";
import "common/samples-common.scss";

export default class HyperModelingApp {
  public static async enableHyperModeling(viewport: ScreenViewport) {
    await HyperModeling.startOrStop(viewport, true);
  }

  public static async disableHyperModeling(viewport: ScreenViewport) {
    await HyperModeling.startOrStop(viewport, false);
  }
}
