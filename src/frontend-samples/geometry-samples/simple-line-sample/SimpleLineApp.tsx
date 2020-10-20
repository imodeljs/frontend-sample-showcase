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
import SimpleLineUI from "./SimpleLineUI";

interface SimpleLineState {
  point1X: number;
  point1Y: number;
  point2X: number;
  point2Y: number;
}

export default class SimpleLineApp implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(true, 10);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <SimpleLineUI></SimpleLineUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static setGeometry(state: SimpleLineState) {
    BlankViewport.decorator.clearGeometry();
    const pointA = Point3d.create(state.point1X, state.point1Y, 0);
    const pointB = Point3d.create(state.point2X, state.point2Y, 0);
    const myLine = LineSegment3d.create(pointA, pointB);
    BlankViewport.decorator.addGeometry(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      BlankViewport.decorator.addPoint(pointAlongLine);
    }
  }
}
