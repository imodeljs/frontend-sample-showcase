/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { CurveChain, CurveChainWithDistanceIndex, CurveFactory, LineString3d, Path, Point3d } from "@bentley/geometry-core";
import ClosestPointOnCurveUI from "./ClosestPointOnCurveUI";

export default class ClosestPointOnCurveApp implements SampleApp {

  public static getClosestPointOnCurve(path: CurveChain, point: Point3d) {
    const indexedChain = CurveChainWithDistanceIndex.createCapture(path);
    if (undefined === indexedChain)
      return;

    const location = indexedChain.closestPoint(point, false);
    return location?.point;
  }

  public static createPath(curveType: string) {
    const sideLength = 10;
    const lowerLeft = Point3d.create(-5, -5);
    const upperRight = Point3d.create(lowerLeft.x + sideLength, lowerLeft.y + sideLength);

    let curveChain: CurveChain | undefined;

    if ("Rounded Rectangle" === curveType)
      curveChain = CurveFactory.createRectangleXY(lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y, 0, 0.5);
    else {
      const points = [
        lowerLeft,
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
        curveChain = CurveFactory.createFilletsInLineString(points, 1);
    }

    return curveChain;
  }

  public static async setup(): Promise<React.ReactNode> {
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);

    return <ClosestPointOnCurveUI decorator={decorator}></ClosestPointOnCurveUI>;
  }
}
