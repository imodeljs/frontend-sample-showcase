/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { CurvePrimitive, Point3d } from "@bentley/geometry-core";
import CurveFractionUI from "./CurveFractionUI";

export default class CurveFractionApp implements SampleApp {

  public static fractionToPointAndDerivative(curve: CurvePrimitive, fraction: number) {
    return curve.fractionToPointAndDerivative(fraction);
  }

  public static getFractionFromPoint(path: CurvePrimitive, point: Point3d) {
    const location = path.closestPoint(point, false);
    return location?.fraction;
  }

}
