/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle, AngleSweep, Arc3d, Box, Cone, Point3d, Range3d, Sphere, TorusPipe } from "@bentley/geometry-core";

export default class Simple3dApp {

  public static createCone(height: number, lowerRadius: number, upperRadius: number): Cone | undefined {
    return Cone.createAxisPoints(Point3d.create(0, 0, 0), Point3d.create(0, 0, height), lowerRadius, upperRadius, true);
  }

  public static createSphere(radius: number): Sphere | undefined {
    return Sphere.createCenterRadius(Point3d.create(0, 0, radius), radius);
  }

  public static createBox(length: number, width: number, height: number): Box | undefined {
    return Box.createRange(new Range3d(0 - length / 2, 0 - width / 2, 0 / 2, 0 + length / 2, 0 + width / 2, height), true);
  }

  public static createTorusPipe(outerRadius: number, innerRadius: number, sweep: number) {
    return TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(0, 0, innerRadius), outerRadius, AngleSweep.create(Angle.createDegrees(sweep))), innerRadius, false);
  }

}
