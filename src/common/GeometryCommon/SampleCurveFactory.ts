/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AngleSweep, Arc3d, CurveChainWithDistanceIndex, CurveFactory, LineSegment3d, LineString3d, Point3d } from "@bentley/geometry-core";

export class SampleCurveFactory {

  public static createCurvePrimitive(curveType: string, sideLength: number) {
    const lowerLeft = Point3d.create(-0.5 * sideLength, -0.5 * sideLength);
    const lowerRight = Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength);
    const upperLeft = Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 1.00 * sideLength);
    const upperRight = Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1.00 * sideLength);

    if ("Line Segment Diagonal" === curveType)
      return LineSegment3d.create(lowerRight, upperLeft);
    else if ("Line Segment Flat Diagonal" === curveType)
      return LineSegment3d.create(
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1 / 3 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 2 / 3 * sideLength));
    else if ("Rounded Rectangle" === curveType)
      return CurveChainWithDistanceIndex.createCapture(CurveFactory.createRectangleXY(lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y, 0, sideLength / 5));
    else if ("Line String" === curveType || "Rounded Line String" === curveType) {
      const points = [
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
        Point3d.create(lowerLeft.x + 0.50 * sideLength, lowerLeft.y + 1.00 * sideLength),
        Point3d.create(lowerLeft.x + 0.50 * sideLength, lowerLeft.y + 0.50 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
      ]
      if ("Line String" === curveType)
        return LineString3d.create(points);
      else if ("Rounded Line String" === curveType)
        return CurveChainWithDistanceIndex.createCapture(CurveFactory.createFilletsInLineString(points, sideLength / 10)!);
    } else if ("Arc" === curveType)
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
