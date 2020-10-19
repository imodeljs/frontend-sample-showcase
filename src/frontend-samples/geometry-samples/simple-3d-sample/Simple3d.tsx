/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AngleSweep, Arc3d, Box, Cone, Point3d, PolyfaceBuilder, Range3d, Sphere, StrokeOptions, TorusPipe } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane"; import { NumericInput, Select } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";

interface Simple3dState {
  shape: string;
  color: ColorDef;
  circleRadius: number;
  boxLength: number;
  boxWidth: number;
  boxHeight: number;
  coneUpperRadius: number;
  coneLowerRadius: number;
  coneHeight: number;
  tpInnerRadius: number;
  tpOuterRadius: number;
  tpSweep: number;
}

export default class Simple3d extends React.Component<{}, Simple3dState> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      shape: "Box",
      color: ColorDef.red,
      circleRadius: 200,
      boxLength: 500,
      boxWidth: 500,
      boxHeight: 500,
      coneUpperRadius: 100,
      coneLowerRadius: 200,
      coneHeight: 300,
      tpInnerRadius: 100,
      tpOuterRadius: 300,
      tpSweep: 360,
    };
  }

  public componentDidMount() {
    this.setGeometry(this.state.shape);
  }

  public componentDidUpdate() {
    this.setGeometry(this.state.shape);
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Box", "Cone", "Sphere", "Torus Pipe"]} onChange={(event) => { this.setState({ shape: event.target.value }) }} />
          <span>Color:</span>
          <ColorPickerButton initialColor={this.state.color} onColorPick={(color: ColorDef) => { this.setState({ color }) }} />
          {this.state.shape === "Sphere" ? <span>Radius:</span> : undefined}
          {this.state.shape === "Sphere" ? <NumericInput defaultValue={this.state.circleRadius} min={0} max={500} onChange={(value) => { if (value) this.setState({ circleRadius: value }) }}></NumericInput> : undefined}

          {this.state.shape === "Box" ? <span>Length:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxLength} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxLength: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Box" ? <span>Width:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxWidth} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxWidth: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Box" ? <span>Height:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxHeight} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxHeight: value }) }}></NumericInput> : undefined}

          {this.state.shape === "Cone" ? <span>Upper Radius:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneUpperRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneUpperRadius: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Cone" ? <span>Lower Radius:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneLowerRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneLowerRadius: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Cone" ? <span>Height:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneHeight} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneHeight: value }) }}></NumericInput> : undefined}

          {this.state.shape === "Torus Pipe" ? <span>Outer Radius:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpOuterRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpOuterRadius: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Torus Pipe" ? <span>Inner Radius:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpInnerRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpInnerRadius: value }) }}></NumericInput> : undefined}
          {this.state.shape === "Torus Pipe" ? <span>Sweep:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpSweep} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpSweep: value }) }}></NumericInput> : undefined}
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Select a shape" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={false}></BlankViewport>
      </>
    )
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Simple3d></Simple3d>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public setGeometry(shape: string) {
    BlankViewport.decorator.clearGeometry();

    const options = new StrokeOptions();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (shape === "Cone") {
      const cone = Cone.createAxisPoints(Point3d.create(500, 500 - this.state.coneHeight / 2, 500), Point3d.create(500, 500 + this.state.coneHeight / 2, 500), this.state.coneLowerRadius, this.state.coneUpperRadius, true)!;
      builder.addCone(cone);
    } else if (shape === "Sphere") {
      const sphere = Sphere.createCenterRadius(Point3d.create(500, 500, 500), this.state.circleRadius)
      builder.addSphere(sphere);
    } else if (shape === "Box") {
      const box = Box.createRange(new Range3d(500 - this.state.boxLength / 2, 500 - this.state.boxWidth / 2, 500 - this.state.boxHeight / 2, 500 + this.state.boxLength / 2, 500 + this.state.boxWidth / 2, 500 + this.state.boxHeight / 2), true)
      if (box)
        builder.addBox(box);
    } else if (shape === "Torus Pipe") {
      const torusPipe = TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(500, 500, 500), this.state.tpOuterRadius, AngleSweep.create(Angle.createDegrees(this.state.tpSweep))), this.state.tpInnerRadius, false)
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(this.state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
