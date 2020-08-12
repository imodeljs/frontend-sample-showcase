/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point2d, Point3d, XAndY, XYAndZ } from "@bentley/geometry-core";
import { BeButton, BeButtonEvent, Cluster, DecorateContext, Decorator, IModelApp, Marker, MarkerSet, HitDetail, GraphicType } from "@bentley/imodeljs-frontend";
import { GeometryStreamProps } from "@bentley/imodeljs-common";

export class GeometryDecorator2d implements Decorator {

  public geometryCallback: (context: CanvasRenderingContext2D) => void;

  public constructor(geometryCallBack: (context: CanvasRenderingContext2D) => void) {
    this.geometryCallback = geometryCallBack;
  }

  public decorate(context: DecorateContext): void {
    if (context.viewport.view.isSpatialView()) {
      context.addCanvasDecoration({ drawDecoration: this.geometryCallback });
    }
  }

}
