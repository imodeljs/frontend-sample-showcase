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

  public static generateSquare(center: Point3d, sideLength: number): Loop {
    const points: Point3d[] = [];
    points.push(Point3d.create(center.x - sideLength / 2, center.y - sideLength / 2));
    points.push(Point3d.create(center.x - sideLength / 2, center.y + sideLength / 2));
    points.push(Point3d.create(center.x + sideLength / 2, center.y + sideLength / 2));
    points.push(Point3d.create(center.x + sideLength / 2, center.y - sideLength / 2));
    points.push(Point3d.create(center.x - sideLength / 2, center.y - sideLength / 2));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateCircle(center: Point3d, radius: number): Loop {
    const circle = Arc3d.createXY(center, radius);
    const loop = Loop.create(circle.clone());
    return loop;
  }

  public static generateTriangle(point1: Point3d, point2: Point3d, point3: Point3d): Loop {
    const points: Point3d[] = [point1, point2, point3];
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    return loop;
  }

  public static generateConvexHull(points: Point3d[]): Loop {
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    const hullGeometry = LineString3d.create(hullPoints);
    const loop = Loop.create(hullGeometry.clone());
    return loop;
  }

  public static async setup(): Promise<React.ReactNode> {
    return <Transformations2dUI></Transformations2dUI>;
  }

}
