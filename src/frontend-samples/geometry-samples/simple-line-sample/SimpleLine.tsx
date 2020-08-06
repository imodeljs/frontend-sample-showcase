/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { LineSegment3d, Point3d } from "@bentley/geometry-core";
export default class SimpleLine implements SampleApp {

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    return <Canvas drawingCallback={SimpleLine.drawingCallback}></Canvas>;
  }

  public static drawingCallback() {
    const circleRadius = 2;
    const pointA = Point3d.create(100, 50);
    const pointB = Point3d.create(260, 340);
    const myLine = LineSegment3d.create(pointA, pointB);

    Canvas.drawLine(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      Canvas.drawCircle(circleRadius, pointAlongLine);
    }
  }
}
