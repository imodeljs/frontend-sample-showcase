/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle, Arc3d, LinearSweep, LineString3d, Path, Point3d, PolyfaceBuilder, Ray3d, RotationalSweep, RuledSweep, StrokeOptions, Vector3d } from "@bentley/geometry-core";

export default class Advanced3dApi {

  public static createLinearSweep() {
    const centerLine = Arc3d.createXY(new Point3d(0, 0, 0), 5);
    const curveChain = Path.create(centerLine);
    return LinearSweep.create(curveChain, new Vector3d(-5, 5, 5), false);
  }

  public static createRotationalSweep() {
    const contour = Arc3d.createXYEllipse(new Point3d(5, -5, 7.5), 0.8, 0.2);
    const curveChain = Path.create(contour);
    return RotationalSweep.create(curveChain, Ray3d.create(new Point3d(5, 5, 7.5), new Vector3d(1, 1, 0)), Angle.createDegrees(180), false);
  }

  public static createRuledSweep() {
    const centerLine = Arc3d.createXY(new Point3d(-5, -5, 5), 5);
    const curveChain = Path.create(centerLine);
    const centerLine2 = Arc3d.createXY(new Point3d(-10, -10, 10), 10);
    const curveChain2 = Path.create(centerLine2);
    const centerLine3 = Arc3d.createXY(new Point3d(0, 0, 0), 10);
    const curveChain3 = Path.create(centerLine3);
    return RuledSweep.create([curveChain2, curveChain, curveChain3], false);
  }

  public static getPolyface(geometryType: string, sweepType: string = "Linear") {
    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);

    if (geometryType === "Sweeps") {
      if (sweepType === "Linear") {
        const sweep = Advanced3dApi.createLinearSweep();
        if (sweep)
          builder.addLinearSweep(sweep);
      } else if (sweepType === "Rotational") {
        const sweep = Advanced3dApi.createRotationalSweep();
        if (sweep)
          builder.addRotationalSweep(sweep);

      } else if (sweepType === "Ruled") {
        const sweep = Advanced3dApi.createRuledSweep();
        if (sweep)
          builder.addRuledSweep(sweep);
      }
    } else if (geometryType === "Mitered Pipes") {
      const centerLine = LineString3d.create([[5, -5, 0], [2, -2, 2], [0, 0, 5], [-5, 5, 5], [-5, 5, 0]]);
      builder.addMiteredPipes(centerLine, 0.5);
    }
    return builder.claimPolyface(true);
  }

}
