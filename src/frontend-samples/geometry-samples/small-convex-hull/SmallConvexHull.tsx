/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { LineString3d, Point3d, Point3dArray } from "@bentley/geometry-core";
export default class SmallConvexHull implements SampleApp {

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    return <Canvas drawingCallback={SmallConvexHull.drawingCallback}></Canvas>;
  }

  public static drawingCallback() {
    const points: Point3d[] = [];
    points.push(Point3d.create(100, 0, 0));
    points.push(Point3d.create(200, 100, 0));
    points.push(Point3d.create(100, 300, 0));
    points.push(Point3d.create(700, 50, 0));
    points.push(Point3d.create(500, 600, 0));
    points.push(Point3d.create(0, 200, 0));
    points.push(Point3d.create(300, 400, 0));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    Canvas.drawPoints(interiorPoints);
    Canvas.drawGeometry(LineString3d.create(hullPoints));
  }
}
