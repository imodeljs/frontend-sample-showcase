/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { LineSegment3d, Point3d } from "@bentley/geometry-core";

export default class SimpleLineApi {

  // START LINESEGMENT
  public static createLineSegmentFromXY(point1X: number, point1Y: number, point2X: number, point2Y: number): LineSegment3d {
    const pointA = Point3d.create(point1X, point1Y, 0);
    const pointB = Point3d.create(point2X, point2Y, 0);
    return LineSegment3d.create(pointA, pointB);
  }
  // END LINESEGMENT

  // START POINTSALONGLINE
  public static createPointsAlongLine(lineSegment: LineSegment3d, fractionsAlongLine: number[]): Point3d[] {
    const points: Point3d[] = [];
    for (const fractionAlongLine of fractionsAlongLine) {
      const pointAlongLine = lineSegment.fractionToPoint(fractionAlongLine);
      points.push(pointAlongLine);
    }
    return points;
  }
  // START POINTSALONGLINE

}
