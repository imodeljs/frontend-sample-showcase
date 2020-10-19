/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, Arc3d, LinearSweep, Path, Point3d, PolyfaceBuilder, Ray3d, RotationalSweep, RuledSweep, StrokeOptions, Vector3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Select } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";

interface Advanced3dState {
  shape: string;
  color: ColorDef;
  sweepType: string;
}

export default class Advanced3d extends React.Component<{}, Advanced3dState> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      shape: "Sweeps",
      color: ColorDef.red,
      sweepType: "Linear",
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
          <Select options={["Sweeps", "Triangulation", "Mitered Pipes"]} onChange={(event) => { this.setState({ shape: event.target.value }); }} />
          <span>Color:</span>
          <ColorPickerButton initialColor={this.state.color} onColorPick={(color: ColorDef) => { this.setState({ color }); }} />
          {this.state.shape === "Sweeps" ? <span>Sweep Type:</span> : undefined}
          {this.state.shape === "Sweeps" ? <Select options={["Linear", "Ruled", "Rotational"]} onChange={(event) => { this.setState({ sweepType: event.target.value }); }} /> : undefined}
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
    return <Advanced3d></Advanced3d>;
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

    if (shape === "Sweeps") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
      const curveChain = Path.create(centerLine);
      if (this.state.sweepType === "Linear") {

        const sweep = LinearSweep.create(curveChain, new Vector3d(50, 50, 50), false);
        if (sweep)
          builder.addLinearSweep(sweep);
      } else if (this.state.sweepType === "Rotational") {
        const sweep = RotationalSweep.create(curveChain, Ray3d.create(new Point3d(750, 750, 750), new Vector3d(250, 250, 250)), Angle.createDegrees(180), false);
        if (sweep)
          builder.addRotationalSweep(sweep);

      } else if (this.state.sweepType === "Ruled") {
        const centerLine2 = Arc3d.createXY(new Point3d(650, 650, 650), 300);
        const curveChain2 = Path.create(centerLine2);

        const centerLine3 = Arc3d.createXY(new Point3d(350, 350, 350), 300);
        const curveChain3 = Path.create(centerLine3);

        const sweep = RuledSweep.create([curveChain2, curveChain, curveChain3], false);
        if (sweep)
          builder.addRuledSweep(sweep);
      }
    } else if (shape === "Triangulation") {
      const points1: Point3d[] = [];
      points1.push(Point3d.create(500, 800, -250));
      points1.push(Point3d.create(500, 300, -250));
      const points2: Point3d[] = [];
      points2.push(Point3d.create(250, 500, 250));
      points2.push(Point3d.create(700, 500, 250));
      builder.addGreedyTriangulationBetweenLineStrings(points1, points2);
    } else if (shape === "Mitered Pipes") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100);
      builder.addMiteredPipes(centerLine, 50);
    }
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(this.state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
