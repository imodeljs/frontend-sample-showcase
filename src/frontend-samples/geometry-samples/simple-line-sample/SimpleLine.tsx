/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { LineSegment3d, Point3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
export default class SimpleLine implements SampleApp {

  public static decorator: GeometryDecorator;

  public static async setup(iModelName: string): Promise<React.ReactNode> {
    SimpleLine.decorator = new GeometryDecorator(SimpleLine.drawingCallback);
    IModelApp.viewManager.addDecorator(SimpleLine.decorator);
    return <BlankViewport force2d={false}></BlankViewport>;
  }

  public static teardown() {
    if (null != SimpleLine.decorator) {
      IModelApp.viewManager.dropDecorator(SimpleLine.decorator);
    }
  }

  public static drawingCallback() {
    const pointA = Point3d.create(0, 0, 0);
    const pointB = Point3d.create(300, 500, 100);
    const myLine = LineSegment3d.create(pointA, pointB);
    SimpleLine.decorator.addLine(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      SimpleLine.decorator.addPoint(pointAlongLine);
    }
  }
}
