/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, Arc3d, LineString3d, Loop, Point3d, Point3dArray, Transform } from "@bentley/geometry-core";
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
    const radians = Angle.degreesToRadians(rotationDeg);
    const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
    if (newGeometry.tryTransformInPlace(rotation)) {
      return newGeometry;
    }
    return undefined;
  }

  public static generateSquare(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(-5, -5, 1));
    points.push(Point3d.create(-5, 5, 1));
    points.push(Point3d.create(5, 5, 1));
    points.push(Point3d.create(5, -5, 1));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateCircle(): Loop {
    const circle = Arc3d.createXY(Point3d.create(0, 0, 1), 5);
    const loop = Loop.create(circle.clone());
    return loop;
  }

  public static generateTriangle(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(0, 5, 1));
    points.push(Point3d.create(-5, -3, 1));
    points.push(Point3d.create(5, -3, 1));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateConvexHull(): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(-8, -5, 1));
    points.push(Point3d.create(-6, -3, 1));
    points.push(Point3d.create(-8, 1, 1));
    points.push(Point3d.create(8, -4, 1));
    points.push(Point3d.create(0, 3, 1));
    points.push(Point3d.create(-10, -1, 1));
    points.push(Point3d.create(-7, -1, 1));
    points.push(Point3d.create(-7, -1, 1));
    points.push(Point3d.create(-7, -1, 1));
    points.push(Point3d.create(-4, 3, 1));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    const hullGeometry = LineString3d.create(hullPoints);
    const loop = Loop.create(hullGeometry.clone());
    return loop;
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(undefined, true, true);
    BlankViewport.decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Transformations2dUI></Transformations2dUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

}
