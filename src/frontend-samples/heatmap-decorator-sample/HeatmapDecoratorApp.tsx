/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { HeatmapDecoratorUI } from "./HeatmapDecoratorUI";
import "../../common/samples-common.scss";
import { IModelApp } from "@bentley/imodeljs-frontend";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Point3d, Range2d } from "@bentley/geometry-core";
import HeatmapDecorator from "./HeatmapDecorator";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class HeatmapDecoratorApp {

  public static decorator?: HeatmapDecorator;
  public static range?: Range2d;
  public static height?: number;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    return <HeatmapDecoratorUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.decorator = undefined;
  }

  public static setupDecorator(points: Point3d[], spreadFactor: number) {
    HeatmapDecoratorApp.decorator = new HeatmapDecorator(points, this.range!, spreadFactor, this.height!);
    HeatmapDecoratorApp.enableDecorations();
  }

  public static enableDecorations() {
    if (HeatmapDecoratorApp.decorator)
      IModelApp.viewManager.addDecorator(HeatmapDecoratorApp.decorator);
  }

  public static disableDecorations() {
    if (undefined === HeatmapDecoratorApp.decorator)
      return;

    IModelApp.viewManager.dropDecorator(HeatmapDecoratorApp.decorator);
  }
}
