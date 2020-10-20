/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Loop } from "@bentley/geometry-core";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Button, NumericInput, Select } from "@bentley/ui-core";
import Transformations2dApp from "./2dTransformationsApp";
import { Point3d } from "@bentley/geometry-core";

interface TransformationState {
  shape: string;
  color: ColorDef;
  xTrans: number;
  yTrans: number;
  rotationDeg: number;
  geometry: Loop;
}

export default class Transformations2dUI extends React.Component<{}, TransformationState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      shape: "Square",
      color: ColorDef.red,
      xTrans: 100,
      yTrans: 100,
      rotationDeg: 180,
      geometry: Transformations2dApp.generateSquare(Point3d.create(0, 0), 400),
    };
  }

  public componentDidUpdate() {
    if (this.state.geometry) {
      BlankViewport.decorator.clearGeometry();
      BlankViewport.decorator.setColor(ColorDef.red);
      BlankViewport.decorator.setLineThickness(5);
      BlankViewport.decorator.addGeometry(this.state.geometry);
    }
  }

  public generateBaseGeometry(shape: string) {
    if (shape === "Square") {
      this.setState({ geometry: Transformations2dApp.generateSquare(Point3d.create(0, 0), 400) });
    } else if (shape === "Circle") {
      this.setState({ geometry: Transformations2dApp.generateCircle(Point3d.create(0, 0), 200) });
    } else if (shape === "Triangle") {
      this.setState({ geometry: Transformations2dApp.generateTriangle(Point3d.create(0, 200, 0), Point3d.create(-250, -100, 0), Point3d.create(250, -100, 0)) });
    } else if (shape === "Convex Hull") {
      const points = [
        Point3d.create(-400, -250, 0),
        Point3d.create(-300, -150, 0),
        Point3d.create(-400, 50, 0),
        Point3d.create(400, -200, 0),
        Point3d.create(0, 150, 0),
        Point3d.create(-500, -50, 0),
        Point3d.create(-350, -50, 0),
        Point3d.create(-310, -50, 0),
        Point3d.create(-320, -50, 0),
        Point3d.create(-200, 150, 0),
      ]
      this.setState({ geometry: Transformations2dApp.generateConvexHull(points) });
    }
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          <span>Shape:</span>
          <Select options={["Square", "Circle", "Triangle", "Convex Hull"]} onChange={(event) => { this.setState({ shape: event.target.value }); this.generateBaseGeometry(event.target.value); }} />
        </div>
        <div className="sample-options-4col" style={{ maxWidth: "350px" }}>
          <span>Translate X</span>
          <NumericInput defaultValue={100} onChange={(value) => { if (value) this.setState({ xTrans: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleTranslation(this.state.geometry, -this.state.xTrans, 0); }}>Shift Left</Button>
          <Button onClick={() => { Transformations2dApp.handleTranslation(this.state.geometry, this.state.xTrans, 0); }}>Shift Right</Button>

          <span>Translate Y</span>
          <NumericInput defaultValue={100} onChange={(value) => { if (value) this.setState({ yTrans: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleTranslation(this.state.geometry, 0, this.state.yTrans); }}>Shift Up</Button>
          <Button onClick={() => { Transformations2dApp.handleTranslation(this.state.geometry, 0, -this.state.yTrans); }}>Shift Down</Button>

          <span>Rotate:</span>
          <NumericInput defaultValue={180} onChange={(value) => { if (value) this.setState({ rotationDeg: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleRotation(this.state.geometry, this.state.rotationDeg); }}>Rotate Left</Button>
          <Button onClick={() => { Transformations2dApp.handleRotation(this.state.geometry, -this.state.rotationDeg); }}>Rotate Right</Button>

        </div>
        <Button onClick={() => { this.generateBaseGeometry(this.state.shape); }}>Reset</Button>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Select a shape, and apply transformations to it." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.generateBaseGeometry(this.state.shape);
  }

}
