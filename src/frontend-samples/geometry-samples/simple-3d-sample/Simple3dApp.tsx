/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AngleSweep, Arc3d, Box, Cone, Point3d, Range3d, Sphere, TorusPipe, Vector3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import Simple3dUI from "./Simple3dUI";

export default class Simple3dApp implements SampleApp {

  public static createBox(center: Point3d, length: number, width: number, height: number): Box | undefined {
    const lowerPt = center.minus(Vector3d.create(length / 2, width / 2, height / 2));
    const upperPt = center.plus(Vector3d.create(length / 2, width / 2, height / 2));
    return Box.createRange(Range3d.create(lowerPt, upperPt), true);
  }

  public static createCone(center: Point3d, height: number, lowerRadius: number, upperRadius: number): Cone | undefined {
    const upVec = Vector3d.create(0, 1, 0);
    const lowerPt = center.plusScaled(upVec, -height);
    const upperPt = center.plusScaled(upVec, height);
    return Cone.createAxisPoints(lowerPt, upperPt, lowerRadius, upperRadius, true);
  }

  public static createSphere(center: Point3d, radius: number): Sphere | undefined {
    return Sphere.createCenterRadius(center, radius);
  }

  public static createTorusPipe(center: Point3d, outerRadius: number, innerRadius: number, sweep: number) {
    return TorusPipe.createAlongArc(Arc3d.createXY(center, outerRadius, AngleSweep.create(Angle.createDegrees(sweep))), innerRadius, false);
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
