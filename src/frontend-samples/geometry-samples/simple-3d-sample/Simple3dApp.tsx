/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AngleSweep, Arc3d, Box, Cone, Point3d, PolyfaceBuilder, Range3d, Sphere, StrokeOptions, TorusPipe } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import Simple3dUI from "./Simple3dUI";

interface Simple3dState {
  shape: string;
  color: ColorDef;
  circleRadius: number;
  boxLength: number;
  boxWidth: number;
  boxHeight: number;
  coneUpperRadius: number;
  coneLowerRadius: number;
  coneHeight: number;
  tpInnerRadius: number;
  tpOuterRadius: number;
  tpSweep: number;
}

export default class Simple3dApp implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Simple3dUI></Simple3dUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static setGeometry(state: Simple3dState) {
    BlankViewport.decorator.clearGeometry();

    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (state.shape === "Cone") {
      const cone = Cone.createAxisPoints(Point3d.create(500, 500 - state.coneHeight / 2, 500), Point3d.create(500, 500 + state.coneHeight / 2, 500), state.coneLowerRadius, state.coneUpperRadius, true);
      if (cone)
        builder.addCone(cone);
    } else if (state.shape === "Sphere") {
      const sphere = Sphere.createCenterRadius(Point3d.create(500, 500, 500), state.circleRadius);
      builder.addSphere(sphere);
    } else if (state.shape === "Box") {
      const box = Box.createRange(new Range3d(500 - state.boxLength / 2, 500 - state.boxWidth / 2, 500 - state.boxHeight / 2, 500 + state.boxLength / 2, 500 + state.boxWidth / 2, 500 + state.boxHeight / 2), true);
      if (box)
        builder.addBox(box);
    } else if (state.shape === "Torus Pipe") {
      const torusPipe = TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(500, 500, 500), state.tpOuterRadius, AngleSweep.create(Angle.createDegrees(state.tpSweep))), state.tpInnerRadius, false);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    BlankViewport.decorator.setColor(state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
