/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle, AngleSweep, Arc3d, Box, Cone, LinearSweep, Path, Point3d, Range3d, Ray3d, RotationalSweep, RuledSweep, Sphere, TorusPipe, Vector3d } from "@bentley/geometry-core";

export default class Geometric3dApi {

  // START GEOMETRY3D
  // START CONE
  public static createCone(height: number, lowerRadius: number, upperRadius: number): Cone | undefined {
    return Cone.createAxisPoints(Point3d.create(0, 0, 0), Point3d.create(0, 0, height), lowerRadius, upperRadius, true);
  }
  // END CONE

  // START SPHERE
  public static createSphere(radius: number): Sphere | undefined {
    return Sphere.createCenterRadius(Point3d.create(0, 0, radius), radius);
  }
  // END SPHERE

  // START BOX
  public static createBox(length: number, width: number, height: number): Box | undefined {
    return Box.createRange(new Range3d(0 - length / 2, 0 - width / 2, 0 / 2, 0 + length / 2, 0 + width / 2, height), true);
  }
  // END BOX

  // START TORUSPIPE
  public static createTorusPipe(outerRadius: number, innerRadius: number, sweep: number) {
    return TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(0, 0, innerRadius), outerRadius, AngleSweep.create(Angle.createDegrees(sweep))), innerRadius, false);
  }
  // END TORUSPIPE

  // END GEOMETRY3D

  // START SWEEPS

  // START LINEARSWEEP
  public static createLinearSweep() {
    const centerLine = Arc3d.createXY(new Point3d(0, 0, 0), 5);
    const curveChain = Path.create(centerLine);
    return LinearSweep.create(curveChain, new Vector3d(-5, 5, 5), false);
  }
  // END LINEARSWEEP

  // START ROTATIONALSWEEP
  public static createRotationalSweep() {
    const contour = Arc3d.createXYEllipse(new Point3d(5, -5, 7.5), 0.8, 0.2);
    const curveChain = Path.create(contour);
    return RotationalSweep.create(curveChain, Ray3d.create(new Point3d(5, 5, 7.5), new Vector3d(1, 1, 0)), Angle.createDegrees(180), false);
  }
  // END ROTATIONALSWEEP

  // START RULEDSWEEP
  public static createRuledSweep() {
    const centerLine = Arc3d.createXY(new Point3d(-5, -5, 5), 5);
    const curveChain = Path.create(centerLine);
    const centerLine2 = Arc3d.createXY(new Point3d(-10, -10, 10), 10);
    const curveChain2 = Path.create(centerLine2);
    const centerLine3 = Arc3d.createXY(new Point3d(0, 0, 0), 10);
    const curveChain3 = Path.create(centerLine3);
    return RuledSweep.create([curveChain2, curveChain, curveChain3], false);
  }
  // END RULEDSWEEP

  // END SWEEPS

}
