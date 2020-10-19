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
import { NumericInput } from "@bentley/ui-core";

interface SimpleLineState {
  point1X: number;
  point1Y: number;
  point2X: number;
  point2Y: number;
}

export default class SimpleLine extends React.Component<{}, SimpleLineState> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      point1X: 140,
      point1Y: 25,
      point2X: 680,
      point2Y: 800,
    };
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(true, 10);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <SimpleLine></SimpleLine>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Point 1 X:</span>
          <NumericInput defaultValue={this.state.point1X} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point1X: value }); }}></NumericInput>
          <span>Point 1 Y:</span>
          <NumericInput defaultValue={this.state.point1Y} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point1Y: value }); }}></NumericInput>
          <span>Point 2 X:</span>
          <NumericInput defaultValue={this.state.point2X} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point2X: value }); }}></NumericInput>
          <span>Point 2 Y:</span>
          <NumericInput defaultValue={this.state.point2Y} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point2Y: value }); }}></NumericInput>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Creating a line segments and some points along it" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.setGeometry();
  }

  public componentDidUpdate() {
    this.setGeometry();
  }

  public setGeometry() {
    BlankViewport.decorator.clearGeometry();
    const pointA = Point3d.create(this.state.point1X, this.state.point1Y, 0);
    const pointB = Point3d.create(this.state.point2X, this.state.point2Y, 0);
    const myLine = LineSegment3d.create(pointA, pointB);
    BlankViewport.decorator.addGeometry(myLine);

    for (const fractionAlongLine of [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1]) {
      const pointAlongLine = myLine.fractionToPoint(fractionAlongLine);
      BlankViewport.decorator.addPoint(pointAlongLine);
    }
  }
}
