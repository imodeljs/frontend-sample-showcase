/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { ControlPane } from "common/ControlPane/ControlPane";
import { NumericInput, Select } from "@bentley/ui-core";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import Simple3dApp from "./Simple3dApp";
import { PolyfaceBuilder, StrokeOptions } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";

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
  decorator: GeometryDecorator;
}

export default class Simple3dUI extends React.Component<{}, Simple3dState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      shape: "Box",
      color: ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)),
      sphereRadius: 4,
      boxLength: 4,
      boxWidth: 4,
      boxHeight: 4,
      coneUpperRadius: 3,
      coneLowerRadius: 5,
      coneHeight: 5,
      tpInnerRadius: 2,
      tpOuterRadius: 5,
      tpSweep: 360,
      decorator,
    };
  }

  public componentDidMount() {
    this.setGeometry();
  }

  public componentDidUpdate() {
    this.setGeometry();
  }

  public setGeometry() {
    this.state.decorator.clearGeometry();

    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (this.state.shape === "Cone") {
      const cone = Simple3dApp.createCone(this.state.coneHeight, this.state.coneLowerRadius, this.state.coneUpperRadius);
      if (cone)
        builder.addCone(cone);
    } else if (this.state.shape === "Sphere") {
      const sphere = Simple3dApp.createSphere(this.state.sphereRadius);
      if (sphere)
        builder.addSphere(sphere);
    } else if (this.state.shape === "Box") {
      const box = Simple3dApp.createBox(this.state.boxLength, this.state.boxWidth, this.state.boxHeight);
      if (box)
        builder.addBox(box);
    } else if (this.state.shape === "Torus Pipe") {
      const torusPipe = Simple3dApp.createTorusPipe(this.state.tpOuterRadius, this.state.tpInnerRadius, this.state.tpSweep);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    this.state.decorator.setColor(this.state.color);
    this.state.decorator.addGeometry(polyface);
    this.state.decorator.drawBase();
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Box", "Cone", "Sphere", "Torus Pipe"]} onChange={(event) => { this.setState({ shape: event.target.value }); }} />
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
          {this.state.shape === "Torus Pipe" ? <NumericInput defaultValue={this.state.tpSweep} min={0} max={360} onChange={(value) => { if (value) this.setState({ tpSweep: value }); }}></NumericInput> : undefined}
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Select a shape" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={false} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
