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
import { ColorDef } from "@bentley/imodeljs-common";
import Advanced3dUI from "./Advanced3dUI";

interface Advanced3dState {
  shape: string;
  color: ColorDef;
  sweepType: string;
}

export default class Advanced3dApp implements SampleApp {

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

  public static setGeometry(state: Advanced3dState) {
    BlankViewport.decorator.clearGeometry();

    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);

    if (state.shape === "Sweeps") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
      const curveChain = Path.create(centerLine);
      if (state.sweepType === "Linear") {

        const sweep = LinearSweep.create(curveChain, new Vector3d(50, 50, 50), false);
        if (sweep)
          builder.addLinearSweep(sweep);
      } else if (state.sweepType === "Rotational") {
        const sweep = RotationalSweep.create(curveChain, Ray3d.create(new Point3d(750, 750, 750), new Vector3d(250, 250, 250)), Angle.createDegrees(180), false);
        if (sweep)
          builder.addRotationalSweep(sweep);

      } else if (state.sweepType === "Ruled") {
        const centerLine2 = Arc3d.createXY(new Point3d(650, 650, 650), 300);
        const curveChain2 = Path.create(centerLine2);

        const centerLine3 = Arc3d.createXY(new Point3d(350, 350, 350), 300);
        const curveChain3 = Path.create(centerLine3);

        const sweep = RuledSweep.create([curveChain2, curveChain, curveChain3], false);
        if (sweep)
          builder.addRuledSweep(sweep);
      }
    } else if (state.shape === "Triangulation") {
      const points1: Point3d[] = [];
      points1.push(Point3d.create(500, 800, -250));
      points1.push(Point3d.create(500, 300, -250));
      const points2: Point3d[] = [];
      points2.push(Point3d.create(250, 500, 250));
      points2.push(Point3d.create(700, 500, 250));
      builder.addGreedyTriangulationBetweenLineStrings(points1, points2);
    } else if (state.shape === "Mitered Pipes") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
      builder.addMiteredPipes(centerLine, 50);
    }
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
