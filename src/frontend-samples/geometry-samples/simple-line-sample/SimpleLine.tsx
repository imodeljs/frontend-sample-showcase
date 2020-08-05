/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { GeometryQuery, Point3d, LineSegment3d } from "@bentley/geometry-core";
export default class SimpleLine implements SampleApp {

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    return <Canvas drawingCallback={SimpleLine.drawingCallback}></Canvas>;
  }

  public static drawingCallback() {
    const allGeometry: GeometryQuery[] = [];
    const circleRadius = 2;
    const pointA = Point3d.create(100, 50);
    const pointB = Point3d.create(260, 340);
    const myLine = LineSegment3d.create(pointA, pointB);
    // draw a line from pointA to pointB ...
    Canvas.drawLine(myLine);

    // draw circles at some fractional coordinates along the line (and one beyond the end )
    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      Canvas.drawCircle(circleRadius, pointAlongLine);
    }
  }
}
