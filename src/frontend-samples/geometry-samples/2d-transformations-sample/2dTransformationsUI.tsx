/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { Loop, Point3d } from "@bentley/geometry-core";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Button, NumericInput, Select } from "@bentley/ui-core";
import Transformations2dApp from "./2dTransformationsApp";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";

interface TransformationState {
  shape: string;
  color: ColorDef;
  xTrans: number;
  yTrans: number;
  rotationDeg: number;
  geometry: Loop;
  decorator: GeometryDecorator;
}

export default class Transformations2dUI extends React.Component<{}, TransformationState> {

  constructor(props?: any) {
    super(props);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      shape: "Square",
      color: ColorDef.red,
      xTrans: 1,
      yTrans: 1,
      rotationDeg: 180,
      geometry: Transformations2dApp.generateSquare(Point3d.create(0, 0), 400),
      decorator,
    };
  }

  public componentDidUpdate() {
    if (this.state.geometry) {
      this.state.decorator.clearGeometry();
      this.state.decorator.setColor(ColorDef.red);
      this.state.decorator.setLineThickness(5);
      this.state.decorator.addGeometry(this.state.geometry);
    }
  }

  public generateBaseGeometry(shape: string) {
    if (shape === "Square") {
      this.setState({ geometry: Transformations2dApp.generateSquare(Point3d.create(0, 0), 8) });
    } else if (shape === "Circle") {
      this.setState({ geometry: Transformations2dApp.generateCircle(Point3d.create(0, 0), 4) });
    } else if (shape === "Triangle") {
      this.setState({ geometry: Transformations2dApp.generateTriangle(Point3d.create(0, 4, 0), Point3d.create(-5, -2, 0), Point3d.create(5, -2, 0)) });
    } else if (shape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-8, -5, 1));
      points.push(Point3d.create(-6, -3, 1));
      points.push(Point3d.create(-8, 1, 1));
      points.push(Point3d.create(8, -4, 1));
      points.push(Point3d.create(0, 3, 1));
      points.push(Point3d.create(-10, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-4, 3, 1));
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
          <NumericInput defaultValue={1} onChange={(value) => { if (value) this.setState({ xTrans: value }); }}></NumericInput>
          <Button onClick={() => { const geometry = Transformations2dApp.handleTranslation(this.state.geometry, -this.state.xTrans, 0); if (geometry) this.setState({ geometry }); }}>Shift Left</Button>
          <Button onClick={() => { const geometry = Transformations2dApp.handleTranslation(this.state.geometry, this.state.xTrans, 0); if (geometry) this.setState({ geometry }); }}>Shift Right</Button>

          <span>Translate Y</span>
          <NumericInput defaultValue={1} onChange={(value) => { if (value) this.setState({ yTrans: value }); }}></NumericInput>
          <Button onClick={() => { const geometry = Transformations2dApp.handleTranslation(this.state.geometry, 0, this.state.yTrans); if (geometry) this.setState({ geometry }); }}>Shift Up</Button>
          <Button onClick={() => { const geometry = Transformations2dApp.handleTranslation(this.state.geometry, 0, -this.state.yTrans); if (geometry) this.setState({ geometry }); }}>Shift Down</Button>

          <span>Rotate:</span>
          <NumericInput defaultValue={180} onChange={(value) => { if (value) this.setState({ rotationDeg: value }); }}></NumericInput>
          <Button onClick={() => { const geometry = Transformations2dApp.handleRotation(this.state.geometry, this.state.rotationDeg); if (geometry) this.setState({ geometry }); }}>Rotate Left</Button>
          <Button onClick={() => { const geometry = Transformations2dApp.handleRotation(this.state.geometry, -this.state.rotationDeg); if (geometry) this.setState({ geometry }); }}>Rotate Right</Button>

        </div>
        <Button onClick={() => { this.generateBaseGeometry(this.state.shape); }}>Reset</Button>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Select a shape, and apply transformations to it." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.generateBaseGeometry(this.state.shape);
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
