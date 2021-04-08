/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import { Point3d, Range2d } from "@bentley/geometry-core";
import HeatmapDecorator from "./HeatmapDecorator";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export interface HeatmapDecoratorSettings {
  showDecorator: boolean;
  points: Point3d[];
  spreadFactor: number;
}

export default class HeatmapDecoratorApp {
  public static decorator?: HeatmapDecorator;
  public static addedDecorator = false;

  public static settings = {
    showDecorator: true,
    points: [],
    spreadFactor: 10,
  };

  public static initalizeApp(vp: ScreenViewport) {
    // Grab range of the contents of the view. We'll use this to size the heatmap.
    const range3d = vp.view.computeFitRange();
    const range = Range2d.createFrom(range3d);

    // We'll draw the heatmap as an overlay in the center of the view's Z extents.
    const height = range3d.high.interpolate(0.5, range3d.low).z;

    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.setupDecorator(HeatmapDecoratorApp.settings.points, range, HeatmapDecoratorApp.settings.spreadFactor, height);
    if (HeatmapDecoratorApp.settings.showDecorator) {
      HeatmapDecoratorApp.enableDecorations();
    }
  }

  public static setupDecorator(points: Point3d[], range: Range2d, spreadFactor: number, height: number) {
    HeatmapDecoratorApp.decorator = new HeatmapDecorator(points, range, spreadFactor, height);
  }

  public static enableDecorations() {
    if (!HeatmapDecoratorApp.addedDecorator && HeatmapDecoratorApp.decorator) {
      IModelApp.viewManager.addDecorator(HeatmapDecoratorApp.decorator);
      HeatmapDecoratorApp.addedDecorator = true;
    }
  }

  public static disableDecorations() {
    if (undefined === HeatmapDecoratorApp.decorator)
      return;

    IModelApp.viewManager.dropDecorator(HeatmapDecoratorApp.decorator);
    HeatmapDecoratorApp.addedDecorator = false;
  }
}
