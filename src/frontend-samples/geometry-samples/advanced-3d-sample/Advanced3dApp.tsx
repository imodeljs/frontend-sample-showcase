/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, Arc3d, LinearSweep, Path, Point3d, PolyfaceBuilder, Ray3d, RotationalSweep, RuledSweep, StrokeOptions, Vector3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import Advanced3dUI from "./Advanced3dUI";

export default class Advanced3dApp implements SampleApp {

  public static createLinearSweep() {
    const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
    const curveChain = Path.create(centerLine);
    return LinearSweep.create(curveChain, new Vector3d(50, 50, 50), false);
  }

  public static createRotationalSweep() {
    const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
    const curveChain = Path.create(centerLine);
    return RotationalSweep.create(curveChain, Ray3d.create(new Point3d(750, 750, 750), new Vector3d(250, 250, 250)), Angle.createDegrees(180), false);
  }

  public static createRuledSweep() {
    const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
    const curveChain = Path.create(centerLine);
    const centerLine2 = Arc3d.createXY(new Point3d(650, 650, 650), 300);
    const curveChain2 = Path.create(centerLine2);
    const centerLine3 = Arc3d.createXY(new Point3d(350, 350, 350), 300);
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
        const sweep = Advanced3dApp.createLinearSweep();
        if (sweep)
          builder.addLinearSweep(sweep);
      } else if (sweepType === "Rotational") {
        const sweep = Advanced3dApp.createRotationalSweep();
        if (sweep)
          builder.addRotationalSweep(sweep);

      } else if (sweepType === "Ruled") {
        const sweep = Advanced3dApp.createRuledSweep();
        if (sweep)
          builder.addRuledSweep(sweep);
      }
    } else if (geometryType === "Triangulation") {
      const points1: Point3d[] = [];
      points1.push(Point3d.create(500, 800, -250));
      points1.push(Point3d.create(500, 300, -250));
      const points2: Point3d[] = [];
      points2.push(Point3d.create(250, 500, 250));
      points2.push(Point3d.create(700, 500, 250));
      builder.addGreedyTriangulationBetweenLineStrings(points1, points2);
    } else if (geometryType === "Mitered Pipes") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
      builder.addMiteredPipes(centerLine, 50);
    }
    return builder.claimPolyface(true);
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Advanced3dUI></Advanced3dUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

}
