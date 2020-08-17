/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { Canvas } from "../GeometryCommon/Canvas";
import { LineSegment3d, Point3d } from "@bentley/geometry-core";
import { GeometryDecorator2d } from "../GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
export default class SimpleLine implements SampleApp {

  public static decorator2d: GeometryDecorator2d;


  public static async setup(iModelName: string): Promise<React.ReactNode> {
    SimpleLine.decorator2d = new GeometryDecorator2d(SimpleLine.drawingCallback)
    IModelApp.viewManager.addDecorator(SimpleLine.decorator2d);
    return <Canvas></Canvas>;
  }

  public static teardown() {
    if (null != SimpleLine.decorator2d) {
      IModelApp.viewManager.dropDecorator(SimpleLine.decorator2d);
    }
  }

  public static drawingCallback() {
    const circleRadius = 2;
    const pointA = Point3d.create(0, 0, 0);
    const pointB = Point3d.create(300, 500, 100);
    const myLine = LineSegment3d.create(pointA, pointB);
    SimpleLine.decorator2d.addLine(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      SimpleLine.decorator2d.addPoint(pointAlongLine);
    }
  }
}
