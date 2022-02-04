/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AngleSweep, Arc3d, LineSegment3d, LineString3d, Point3d } from "@itwin/core-geometry";

export class SampleCurveFactory {

  public static createCurvePrimitive(curveType: string, sideLength: number) {
    const lowerLeft = Point3d.create(-0.5 * sideLength, -0.5 * sideLength);

    if ("Line Segment Flat Diagonal" === curveType)
      return LineSegment3d.create(
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1 / 3 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 2 / 3 * sideLength));
    else if ("Arc" === curveType)
      return Arc3d.createXY(lowerLeft, sideLength, AngleSweep.createStartEndDegrees(0, 90));
    else if ("Elliptical Arc" === curveType)
      return Arc3d.createXYEllipse(lowerLeft, sideLength, sideLength / 2, AngleSweep.createStartEndDegrees(0, 90));
    else if ("Step Line String" === curveType)
      return LineString3d.create([
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1.00 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 1.00 * sideLength),
      ]);
    else if ("Half Step Line String" === curveType)
      return LineString3d.create([
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
      ]);

    return undefined;
  }
}
