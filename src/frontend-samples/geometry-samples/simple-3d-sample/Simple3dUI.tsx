/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane"; import { NumericInput, Select } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import Simple3dApp from "./Simple3dApp";
import { Point3d, PolyfaceBuilder, StrokeOptions } from "@bentley/geometry-core";

interface Simple3dState {
  shape: string;
  color: ColorDef;
  sphereRadius: number;
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

export default class Simple3dUI extends React.Component<{}, Simple3dState> {

  constructor(props?: any) {
    super(props);
    this.state = {
      shape: "Box",
      color: ColorDef.red,
      sphereRadius: 200,
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
    this.setGeometry();
  }

  public componentDidUpdate() {
    this.setGeometry();
  }

  public setGeometry() {
    BlankViewport.decorator.clearGeometry();

    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    const centerPt = Point3d.create(500, 500, 500);

    if (this.state.shape === "Cone") {
      const cone = Simple3dApp.createCone(centerPt, this.state.coneHeight, this.state.coneLowerRadius, this.state.coneUpperRadius);
      if (cone)
        builder.addCone(cone);
    } else if (this.state.shape === "Sphere") {
      const sphere = Simple3dApp.createSphere(centerPt, this.state.sphereRadius);
      if (sphere)
        builder.addSphere(sphere);
    } else if (this.state.shape === "Box") {
      const box = Simple3dApp.createBox(centerPt, this.state.boxLength, this.state.boxWidth, this.state.boxHeight);
      if (box)
        builder.addBox(box);
    } else if (this.state.shape === "Torus Pipe") {
      const torusPipe = Simple3dApp.createTorusPipe(centerPt, this.state.tpOuterRadius, this.state.tpInnerRadius, this.state.tpSweep);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    BlankViewport.decorator.setColor(this.state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Box", "Cone", "Sphere", "Torus Pipe"]} onChange={(event) => { this.setState({ shape: event.target.value }); }} />
          <span>Color:</span>
          <ColorPickerButton initialColor={this.state.color} onColorPick={(color: ColorDef) => { this.setState({ color }); }} />
          {this.state.shape === "Sphere" ? <span>Radius:</span> : undefined}
          {this.state.shape === "Sphere" ? <NumericInput defaultValue={this.state.sphereRadius} min={0} max={500} onChange={(value) => { if (value) this.setState({ sphereRadius: value }); }}></NumericInput> : undefined}

          {this.state.shape === "Box" ? <span>Length:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxLength} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxLength: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Box" ? <span>Width:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxWidth} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxWidth: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Box" ? <span>Height:</span> : undefined}
          {this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxHeight} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxHeight: value }); }}></NumericInput> : undefined}

          {this.state.shape === "Cone" ? <span>Upper Radius:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneUpperRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneUpperRadius: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Cone" ? <span>Lower Radius:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneLowerRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneLowerRadius: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Cone" ? <span>Height:</span> : undefined}
          {this.state.shape === "Cone" ? <NumericInput defaultValue={this.state.coneHeight} min={0} max={1000} onChange={(value) => { if (value) this.setState({ coneHeight: value }); }}></NumericInput> : undefined}

          {this.state.shape === "Torus Pipe" ? <span>Outer Radius:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpOuterRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpOuterRadius: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Torus Pipe" ? <span>Inner Radius:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpInnerRadius} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpInnerRadius: value }); }}></NumericInput> : undefined}
          {this.state.shape === "Torus Pipe" ? <span>Sweep:</span> : undefined}
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpSweep} min={0} max={1000} onChange={(value) => { if (value) this.setState({ tpSweep: value }); }}></NumericInput> : undefined}
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
    );
  }

}
