/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AngleSweep, Arc3d, Box, Cone, Point3d, Range3d, Sphere, TorusPipe } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import Simple3dUI from "./Simple3dUI";

export default class Simple3dApp implements SampleApp {

  public static createCone(height: number, lowerRadius: number, upperRadius: number): Cone | undefined {
    return Cone.createAxisPoints(Point3d.create(500, 500 - height / 2, 500), Point3d.create(500, 500 + height / 2, 500), lowerRadius, upperRadius, true);
  }

  public static createSphere(radius: number): Sphere | undefined {
    return Sphere.createCenterRadius(Point3d.create(500, 500, 500), radius);
  }

  public static createBox(length: number, width: number, height: number): Box | undefined {
    return Box.createRange(new Range3d(500 - length / 2, 500 - width / 2, 500 - height / 2, 500 + length / 2, 500 + width / 2, 500 + height / 2), true);
  }

  public static createTorusPipe(outerRadius: number, innerRadius: number, sweep: number) {
    return TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(500, 500, 500), outerRadius, AngleSweep.create(Angle.createDegrees(sweep))), innerRadius, false);
  }

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

}
