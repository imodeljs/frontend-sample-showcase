/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { CurveChain, CurveChainWithDistanceIndex, CurveFactory, LineString3d, Path, Point3d, Arc3d, Vector3d, AngleSweep, LineSegment3d } from "@bentley/geometry-core";
import CurveFractionUI from "./CurveFractionUI";

export default class CurveFractionApp implements SampleApp {

  public static fractionToPointAndDerivative(path: CurveChain, fraction: number) {
    const indexedChain = CurveChainWithDistanceIndex.createCapture(path);
    if (undefined === indexedChain)
      return;

    return indexedChain.fractionToPointAndDerivative(fraction);
  }

  public static getFractionFromPoint(path: CurveChain, point: Point3d) {
    const indexedChain = CurveChainWithDistanceIndex.createCapture(path);
    if (undefined === indexedChain)
      return;

    const location = indexedChain.closestPoint(point, false);
    return location?.fraction;
  }

  public static createPath(curveType: string, sideLength: number) {
    const lowerLeft = Point3d.create(-0.5 * sideLength, -0.5 * sideLength);
    const lowerRight = Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength);
    const upperLeft = Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 1.00 * sideLength);
    const upperRight = Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1.00 * sideLength);

    let curveChain: CurveChain | undefined;

    if ("Line Segment Diagonal" === curveType)
      curveChain = Path.create(LineSegment3d.create(lowerRight, upperLeft));
    else if ("Line Segment Flat Diagonal" === curveType)
      curveChain = Path.create(LineSegment3d.create(
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1 / 3 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 2 / 3 * sideLength)));
    else if ("Rounded Rectangle" === curveType)
      curveChain = CurveFactory.createRectangleXY(lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y, 0, sideLength / 5);
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
        curveChain = Path.create(LineString3d.create(points));
      else if ("Rounded Line String" === curveType)
        curveChain = CurveFactory.createFilletsInLineString(points, sideLength / 10);
    } else if ("Arc" === curveType)
      curveChain = Path.create(Arc3d.createXY(lowerLeft, sideLength, AngleSweep.createStartEndDegrees(0, 90)));
    else if ("Elliptical Arc" === curveType)
      curveChain = Path.create(Arc3d.createXYEllipse(lowerLeft, sideLength, sideLength / 2, AngleSweep.createStartEndDegrees(0, 90)))
    else if ("Step Line String" === curveType)
      curveChain = Path.create(LineString3d.create([
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 1.00 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 1.00 * sideLength),
      ]));
    else if ("Half Step Line String" === curveType)
      curveChain = Path.create(LineString3d.create([
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.00 * sideLength),
        Point3d.create(lowerLeft.x + 1.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
        Point3d.create(lowerLeft.x + 0.00 * sideLength, lowerLeft.y + 0.50 * sideLength),
      ]));

    return curveChain;
  }

  public static async setup(): Promise<React.ReactNode> {
    return <CurveFractionUI></CurveFractionUI>;
  }
}
