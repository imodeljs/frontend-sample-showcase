/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import SampleApp from "common/SampleApp";
import { CurvePrimitive, Point3d } from "@bentley/geometry-core";

export default class ClosestPointOnCurveApp implements SampleApp {

  public static getClosestPointOnCurve(curve: CurvePrimitive, point: Point3d) {
    const location = curve.closestPoint(point, false);
    return location?.point;
  }

}
