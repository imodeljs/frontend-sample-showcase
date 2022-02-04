/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { CurvePrimitive, Point3d } from "@itwin/core-geometry";

export default class CurveFractionApi {

  public static fractionToPointAndDerivative(curve: CurvePrimitive, fraction: number) {
    return curve.fractionToPointAndDerivative(fraction);
  }

  public static getFractionFromPoint(path: CurvePrimitive, point: Point3d) {
    const location = path.closestPoint(point, false);
    return location?.fraction;
  }

}
