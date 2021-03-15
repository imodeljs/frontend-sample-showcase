/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { ControlPane } from "common/ControlPane/ControlPane";
import { NumericInput } from "@bentley/ui-core";
import SimpleLineApp from "./SimpleLineApp";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { InteractivePointMarker } from "common/Geometry/InteractivePointMarker";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";

interface SimpleLineState {
  point1X: number;
  point1Y: number;
  point2X: number;
  point2Y: number;
  decorator: GeometryDecorator;
}

export default class SimpleLine extends React.Component<{}, SimpleLineState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      point1X: -25,
      point1Y: -25,
      point2X: 20,
      point2Y: 20,
      decorator,
    };
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Point 1 X:</span>
          <NumericInput defaultValue={this.state.point1X} onChange={(value) => { if (value) this.setState({ point1X: value }); }}></NumericInput>
          <span>Point 1 Y:</span>
          <NumericInput defaultValue={this.state.point1Y} onChange={(value) => { if (value) this.setState({ point1Y: value }); }}></NumericInput>
          <span>Point 2 X:</span>
          <NumericInput defaultValue={this.state.point2X} onChange={(value) => { if (value) this.setState({ point2X: value }); }}></NumericInput>
          <span>Point 2 Y:</span>
          <NumericInput defaultValue={this.state.point2Y} onChange={(value) => { if (value) this.setState({ point2Y: value }); }}></NumericInput>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Creating a line segments and some points along it" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.setGeometry();
  }

  public componentDidUpdate() {
    this.setGeometry();
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

  public setGeometry() {
    this.state.decorator.clearGeometry();
    const myLine = SimpleLineApp.createLineSegmentFromXY(this.state.point1X, this.state.point1Y, this.state.point2X, this.state.point2Y);
    this.state.decorator.addGeometry(myLine);
    const fractions = [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1];
    const points = SimpleLineApp.createPointsAlongLine(myLine, fractions);
    points.forEach((point, i) => {
      const marker = new InteractivePointMarker(point, `Fraction = ${fractions[i]}`, ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)), () => { });
      this.state.decorator.addMarker(marker);
    });
  }

}
