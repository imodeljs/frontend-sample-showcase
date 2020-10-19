/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Arc3d, LineString3d, Loop, Point3d, Point3dArray, Range3d, Transform } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Button, NumericInput, Select } from "@bentley/ui-core";

interface TransformationState {
  shape: string;
  color: ColorDef;
  xTrans: number;
  yTrans: number;
  rotationDeg: number;
  geometry: Loop | undefined;
}

export default class TwoDimTransformations extends React.Component<{}, TransformationState> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      shape: "Square",
      color: ColorDef.red,
      xTrans: 100,
      yTrans: 100,
      rotationDeg: 180,
      geometry: undefined,
    };
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(new Range3d(-500, -500, 0, 500, 500, 0));
    BlankViewport.decorator = new GeometryDecorator(true, 10);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <TwoDimTransformations></TwoDimTransformations>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public componentDidUpdate() {
    this.setGeometry();
  }

  public handleLeftXTranslation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(-this.state.xTrans, 0, 0)) {
          this.setState({ geometry: newGeometry });
        }
    }
  }

  public handleRightXTranslation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(this.state.xTrans, 0, 0)) {

          this.setState({ geometry: newGeometry });
        }
    }
  }

  public handleUpYTranslation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(0, this.state.yTrans, 0)) {

          this.setState({ geometry: newGeometry });
        }
    }
  }

  public handleDownYTranslation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(0, -this.state.yTrans, 0)) {

          this.setState({ geometry: newGeometry });
        }
    }
  }

  public handleLeftRotation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry) {
        const radians = this.state.rotationDeg / 57.2958;
        const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
        if (newGeometry.tryTransformInPlace(rotation)) {

          this.setState({ geometry: newGeometry });
        }
      }
    }
  }

  public handleRightRotation() {
    if (this.state.geometry) {
      const newGeometry = this.state.geometry;
      if (newGeometry) {
        const radians = -this.state.rotationDeg / 57.2958;
        const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
        if (newGeometry.tryTransformInPlace(rotation)) {

          this.setState({ geometry: newGeometry });
        }
      }
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
          <Button onClick={() => { this.handleLeftXTranslation(); }}>Shift Left</Button>
          <Button onClick={() => { this.handleRightXTranslation(); }}>Shift Right</Button>

          <span>Translate Y</span>
          <NumericInput defaultValue={100} onChange={(value) => { if (value) this.setState({ yTrans: value }); }}></NumericInput>
          <Button onClick={() => { this.handleUpYTranslation(); }}>Shift Up</Button>
          <Button onClick={() => { this.handleDownYTranslation(); }}>Shift Down</Button>

          <span>Rotate:</span>
          <NumericInput defaultValue={180} onChange={(value) => { if (value) this.setState({ rotationDeg: value }); }}></NumericInput>
          <Button onClick={() => { this.handleLeftRotation(); }}>Rotate Left</Button>
          <Button onClick={() => { this.handleRightRotation(); }}>Rotate Right</Button>

        </div>
        <Button onClick={() => { this.generateBaseGeometry(); }}>Reset</Button>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Creating a set of points, and constructing a convex shape from them" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    this.generateBaseGeometry();
  }

  public generateBaseGeometry(shape: string = this.state.shape) {
    if (shape === "Square") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-200, -200, 0));
      points.push(Point3d.create(-200, 200, 0));
      points.push(Point3d.create(200, 200, 0));
      points.push(Point3d.create(200, -200, 0));
      const linestring = LineString3d.create(points);
      const loop = Loop.create(linestring.clone());
      this.setState({ geometry: loop });

    } else if (shape === "Circle") {
      const circle = Arc3d.createXY(Point3d.create(0, 0, 0), 200);
      const loop = Loop.create(circle.clone());
      this.setState({ geometry: loop });
    } else if (shape === "Triangle") {
      const points: Point3d[] = [];
      points.push(Point3d.create(0, 200, 0));
      points.push(Point3d.create(-250, -100, 0));
      points.push(Point3d.create(250, -100, 0));
      const linestring = LineString3d.create(points);
      const loop = Loop.create(linestring.clone());
      this.setState({ geometry: loop });

    } else if (shape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-400, 0, 0));
      points.push(Point3d.create(-300, 100, 0));
      points.push(Point3d.create(-400, 300, 0));
      points.push(Point3d.create(400, 50, 0));
      points.push(Point3d.create(0, 400, 0));
      points.push(Point3d.create(-500, 200, 0));
      points.push(Point3d.create(-350, 200, 0));
      points.push(Point3d.create(-310, 200, 0));
      points.push(Point3d.create(-320, 200, 0));
      points.push(Point3d.create(-200, 400, 0));
      const hullPoints: Point3d[] = [];
      const interiorPoints: Point3d[] = [];
      Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
      const hullGeometry = LineString3d.create(hullPoints);
      const loop = Loop.create(hullGeometry.clone());
      this.setState({ geometry: loop });
    }
  }

  public setGeometry() {
    BlankViewport.decorator.clearGeometry();
    BlankViewport.decorator.setColor(ColorDef.red);
    BlankViewport.decorator.setLineThickness(5);
    if (this.state.geometry)
      BlankViewport.decorator.addGeometry(this.state.geometry);
  }
}
