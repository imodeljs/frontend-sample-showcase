/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { IModelApp } from "@itwin/core-frontend";
import { Point3d, Range2d } from "@itwin/core-geometry";
import HeatmapDecorator from "./HeatmapDecorator";

export default class HeatmapDecoratorApi {
  public static decorator?: HeatmapDecorator;
  public static addedDecorator = false;

  public static setupDecorator(points: Point3d[], range: Range2d, spreadFactor: number, height: number) {
    if(undefined === HeatmapDecoratorApi.decorator)
      HeatmapDecoratorApi.decorator = new HeatmapDecorator(points, range, spreadFactor, height);
  }

  public static enableDecorations() {
    if (!HeatmapDecoratorApi.addedDecorator && HeatmapDecoratorApi.decorator) {
      IModelApp.viewManager.addDecorator(HeatmapDecoratorApi.decorator);
      HeatmapDecoratorApi.addedDecorator = true;
    }
  }

  public static disableDecorations() {
    if (undefined === HeatmapDecoratorApi.decorator)
      return;

    IModelApp.viewManager.dropDecorator(HeatmapDecoratorApi.decorator);
    HeatmapDecoratorApi.addedDecorator = false;
  }
}
