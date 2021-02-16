/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { CurvePrimitive, Point3d } from "@bentley/geometry-core";
import ClosestPointOnCurveUI from "./ClosestPointOnCurveUI";

export default class ClosestPointOnCurveApp implements SampleApp {

  public static getClosestPointOnCurve(curve: CurvePrimitive, point: Point3d) {
    const location = curve.closestPoint(point, false);
    return location?.point;
  }

}
