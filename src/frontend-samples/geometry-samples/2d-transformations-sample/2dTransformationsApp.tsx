/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Arc3d, LineString3d, Loop, Point3d, Point3dArray, Range3d, Transform } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import Transformations2dUI from "./2dTransformationsUI";

export default class Transformations2dApp implements SampleApp {

  public static handleTranslation(geometry: Loop, xTrans: number, yTrans: number): Loop | undefined {
    const newGeometry = geometry;
    if (newGeometry.tryTranslateInPlace(xTrans, yTrans, 0)) {
      return newGeometry;
    }
    return undefined;
  }

  public static handleRotation(geometry: Loop, rotationDeg: number): Loop | undefined {
    const newGeometry = geometry;
    const radians = rotationDeg * 180 / Math.PI;
    const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
    if (newGeometry.tryTransformInPlace(rotation)) {
      return newGeometry;
    }
    return undefined;
  }

  public static generateSquare(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(-200, -200, 0));
    points.push(Point3d.create(-200, 200, 0));
    points.push(Point3d.create(200, 200, 0));
    points.push(Point3d.create(200, -200, 0));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateCircle(): Loop {
    const circle = Arc3d.createXY(Point3d.create(0, 0, 0), 200);
    const loop = Loop.create(circle.clone());
    return loop;
  }

  public static generateTriangle(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(0, 200, 0));
    points.push(Point3d.create(-250, -100, 0));
    points.push(Point3d.create(250, -100, 0));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateConvexHull(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(-400, -250, 0));
    points.push(Point3d.create(-300, -150, 0));
    points.push(Point3d.create(-400, 50, 0));
    points.push(Point3d.create(400, -200, 0));
    points.push(Point3d.create(0, 150, 0));
    points.push(Point3d.create(-500, -50, 0));
    points.push(Point3d.create(-350, -50, 0));
    points.push(Point3d.create(-310, -50, 0));
    points.push(Point3d.create(-320, -50, 0));
    points.push(Point3d.create(-200, 150, 0));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    const hullGeometry = LineString3d.create(hullPoints);
    const loop = Loop.create(hullGeometry.clone());
    return loop;
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(new Range3d(-500, -500, 0, 500, 500, 0));
    BlankViewport.decorator = new GeometryDecorator(true, 10);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Transformations2dUI></Transformations2dUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

}
