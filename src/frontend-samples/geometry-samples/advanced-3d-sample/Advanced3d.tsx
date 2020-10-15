/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Angle, AngleSweep, Arc3d, Box, Cone, CurveChain, CurvePrimitive, GrowableXYZArray, HalfEdgeGraph, LinearSweep, LineString3d, Path, Point3d, Polyface, PolyfaceBuilder, Range3d, Sphere, StrokeOptions, TorusPipe, UVSurfaceOps, Vector3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point, Select } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import { Input } from "@bentley/ui-core";
import { NumericInput } from "@bentley/ui-core";

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
    this.setGeometry(this.state.shape)
  }

  public componentDidUpdate() {
    this.setGeometry(this.state.shape)
  }


  //{this.state.shape === "Box" ? <span>Length:</span> : undefined}
  //{this.state.shape === "Box" ? <NumericInput defaultValue={this.state.boxLength} min={0} max={1000} onChange={(value) => { if (value) this.setState({ boxLength: value }) }}></NumericInput> : undefined}


  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Sweeps", "Triangulation", "Mitered Pipes", "Graphs", "Facets"]} onChange={(event) => { this.setState({ shape: event.target.value }) }} />
          <span>Color:</span>
          <ColorPickerButton initialColor={this.state.color} onColorPick={(color: ColorDef) => { this.setState({ color }) }} />
          {this.state.shape === "Sweeps" ? <span>Sweep Type:</span> : undefined}
          {this.state.shape === "Sweeps" ? <Select options={["Linear", "Ruled", "Rotational"]} onChange={(event) => { this.setState({ sweepType: event.target.value }) }} /> : undefined}

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
      if (this.state.sweepType === "Linear") {
        const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100)
        const curveChain = Path.create(centerLine)
        const sweep = LinearSweep.create(curveChain, new Vector3d(50, 50, 50), true)
        if (sweep)
          builder.addLinearSweep(sweep);
      }
      else if (this.state.sweepType === "Rotational") {
        //if (sweep)
        //  builder.addRotationalSweep(sweep);
      }
      else if (this.state.sweepType === "Ruled") {
        //if (sweep)
        //  builder.addRotationalSweep(sweep);
      }
    } else if (shape === "Triangle Fan") {
      console.log("Tfan")
      const conePoint = Point3d.create(100, 0, 0);

      const points: Point3d[] = [];
      points.push(Point3d.create(200, 100, 0));
      points.push(Point3d.create(100, 300, 0));

      const linestring = LineString3d.create(points);

      builder.addTriangleFan(conePoint, linestring, true)
    } else if (shape === "Triangulation") {
      //const surface = new UVSurface
      const points1: Point3d[] = [];
      points1.push(Point3d.create(200, 100, 0));
      points1.push(Point3d.create(100, 300, 0));
      const points2: Point3d[] = [];
      points2.push(Point3d.create(500, 250, 0));
      points2.push(Point3d.create(700, 600, 0));
      builder.addGreedyTriangulationBetweenLineStrings(points1, points2)
    } else if (shape === "Graphs") {
      const graph = new HalfEdgeGraph()
      graph.addEdgeXY(200, 200, 500, 500)
      graph.addEdgeXY(500, 500, 750, 750)
      builder.addGraph(graph, true)
    } else if (shape === "Mitered Pipes") {
      const centerLine = Arc3d.createXY(new Point3d(500, 500, 500), 100)
      builder.addMiteredPipes(centerLine, 50)
    } else if (shape === "Facets") {
      const array = new GrowableXYZArray()
      array.pushFrom(new Point3d(100, 100, 100))
      array.pushFrom(new Point3d(700, 700, 700))

      builder.addFacetFromGrowableArrays(array, array, undefined, undefined)
    }
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(this.state.color);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
