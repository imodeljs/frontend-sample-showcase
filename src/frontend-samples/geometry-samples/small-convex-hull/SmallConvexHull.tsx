/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { GeometryQuery, Point3d, LineSegment3d, Point3dArray, LineString3d } from "@bentley/geometry-core";
export default class SmallConvexHull implements SampleApp {

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    return <Canvas drawingCallback={SmallConvexHull.drawingCallback}></Canvas>;
  }

  public static drawingCallback() {
    const allGeometry: GeometryQuery[] = [];
    const points: Point3d[] = [];
    points.push(Point3d.create(1, 0, 0));
    points.push(Point3d.create(2, 1, 0));
    points.push(Point3d.create(1, 3, 0));
    points.push(Point3d.create(8, 0.5, 0));
    points.push(Point3d.create(5, 6, 0));
    points.push(Point3d.create(-1, 2, 0));
    points.push(Point3d.create(3, 4, 0));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    // output circles at the original points . . .
    Canvas.drawPoints(interiorPoints);
    // Output a linestring . . .
    Canvas.drawGeometry(LineString3d.create(hullPoints));
  }
}
