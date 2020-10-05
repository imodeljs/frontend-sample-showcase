/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Arc3d, Box, Cone, Point3d, PolyfaceBuilder, Range3d, Sphere, StrokeOptions, TorusPipe } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Select } from "@bentley/ui-core";

export default class Simple3d extends React.Component<{}, { shape: string }> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      shape: "Box",
    };
  }

  public componentDidMount() {
    this.setGeometry(this.state.shape)
  }

  public componentDidUpdate() {
    this.setGeometry(this.state.shape)
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape</span>
          <Select options={["Box", "Cone", "Sphere", "Torus Pipe"]} onChange={(event) => { this.setState({ shape: event.target.value }) }} />

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
    //if (!IModelApp.viewManager.getFirstOpenView()!.view.isCameraEnabled())
    //  IModelApp.viewManager.getFirstOpenView()!.turnCameraOn()
    // Make a meshed con
    BlankViewport.decorator.clearGeometry();

    const options = new StrokeOptions();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (shape === "Cone") {
      const cone = Cone.createAxisPoints(Point3d.create(500, 350, 500), Point3d.create(500, 650, 500), 250, 100, true)!;
      builder.addCone(cone);
    } else if (shape === "Sphere") {
      const sphere = Sphere.createCenterRadius(Point3d.create(500, 350, 500), 150)
      builder.addSphere(sphere);
    } else if (shape === "Box") {
      const box = Box.createRange(new Range3d(250, 250, 250, 750, 750, 750), true)
      if (box)
        builder.addBox(box);
    } else if (shape === "Torus Pipe") {
      const torusPipe = TorusPipe.createAlongArc(Arc3d.createXY(new Point3d(500, 500, 500), 300), 100, false)
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(ColorDef.blue);
    BlankViewport.decorator.addGeometry(polyface);
  }

}
