/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "../GeometryCommon/BlankViewport";
import { LineString3d, Loop, Point3d, Point3dArray } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "../GeometryCommon/GeometryDecorator";
export default class SmallConvexHull implements SampleApp {

  public static decorator: GeometryDecorator;

  public static async setup(iModelName: string): Promise<React.ReactNode> {
    SmallConvexHull.decorator = new GeometryDecorator(SmallConvexHull.drawingCallback);
    IModelApp.viewManager.addDecorator(SmallConvexHull.decorator);
    return <BlankViewport force2d={false}></BlankViewport>;
  }

  public static teardown() {
    if (null != SmallConvexHull.decorator)
      IModelApp.viewManager.dropDecorator(SmallConvexHull.decorator);
  }

  public static drawingCallback() {
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
    SmallConvexHull.decorator.addPoints(interiorPoints);
    const hullGeometry = LineString3d.create(hullPoints);
    SmallConvexHull.decorator.addGeometry(hullGeometry);
    const loop = Loop.create(hullGeometry.clone());
    loop.tryTranslateInPlace(0, 400, 0);
    SmallConvexHull.decorator.addGeometry(loop);
  }
}
