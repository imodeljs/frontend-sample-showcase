/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import HeatmapDecorator from "./HeatmapDecorator";

export default class HeatmapDecoratorApi {

  public static setupDecorator() {
    return new HeatmapDecorator();
  }

  public static enableDecorations(decorator: HeatmapDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: HeatmapDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }
}
