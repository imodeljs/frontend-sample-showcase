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

export default class SimpleLineApp implements SampleApp {

  public static createLineSegmentFromXY(point1X: number, point1Y: number, point2X: number, point2Y: number): LineSegment3d {
    const pointA = Point3d.create(point1X, point1Y, 0);
    const pointB = Point3d.create(point2X, point2Y, 0);
    return LineSegment3d.create(pointA, pointB);
  }

  public static createPointsAlongLine(lineSegment: LineSegment3d, fractionsAlongLine: number[]): Point3d[] {
    const points: Point3d[] = [];
    for (const fractionAlongLine of fractionsAlongLine) {
      const pointAlongLine = lineSegment.fractionToPoint(fractionAlongLine);
      points.push(pointAlongLine);
    }
    return points;
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(undefined, true, true);
    BlankViewport.decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <SimpleLineUI></SimpleLineUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }
}
