/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { LineString3d, Point3d, Point3dArray, Loop } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator2d } from "../GeometryCommon/GeometryDecorator";
export default class SmallConvexHull implements SampleApp {

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    Canvas.decorator2d = new GeometryDecorator2d(SmallConvexHull.drawingCallback);
    IModelApp.viewManager.addDecorator(Canvas.decorator2d);

    return <Canvas drawingCallback={SmallConvexHull.drawingCallback}></Canvas>;
  }

  public static teardown() {
    if (null != Canvas.decorator2d)
      IModelApp.viewManager.dropDecorator(Canvas.decorator2d);
  }

  public static drawingCallback(context: CanvasRenderingContext2D) {
    const points: Point3d[] = [];
    points.push(Point3d.create(100, 0, 0));
    points.push(Point3d.create(200, 100, 0));
    points.push(Point3d.create(100, 300, 0));
    points.push(Point3d.create(700, 50, 0));
    points.push(Point3d.create(500, 600, 0));
    points.push(Point3d.create(0, 200, 0));
    points.push(Point3d.create(150, 200, 0));
    points.push(Point3d.create(190, 200, 0));
    points.push(Point3d.create(180, 200, 0));
    points.push(Point3d.create(300, 400, 0));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    Canvas.drawPoints(context, interiorPoints);
    const hullGeometry = LineString3d.create(hullPoints)
    Canvas.drawGeometry(context, hullGeometry, false);
    const loop = Loop.create(hullGeometry);
    loop.tryTranslateInPlace(0, 400, 0);
    Canvas.drawGeometry(context, loop, false);
    Canvas.drawText(context, "test", 200, 200, 60);
  }
}
