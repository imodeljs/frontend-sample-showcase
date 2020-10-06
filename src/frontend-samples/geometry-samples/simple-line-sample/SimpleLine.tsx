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
import { ControlPane } from "Components/ControlPane/ControlPane";
export default class SimpleLine extends React.Component<{}, {}> implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <SimpleLine></SimpleLine>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Creating a line segments and some points along it"></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.setGeometry();
  }

  public setGeometry() {
    const pointA = Point3d.create(140, 25, 0);
    const pointB = Point3d.create(680, 800, 0);
    const myLine = LineSegment3d.create(pointA, pointB);
    BlankViewport.decorator.addGeometry(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      BlankViewport.decorator.addPoint(pointAlongLine);
    }
  }
}
