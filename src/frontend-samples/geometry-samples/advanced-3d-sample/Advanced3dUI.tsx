/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Select } from "@bentley/ui-core";
import Advanced3dApp from "./Advanced3dApp";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { Advanced3dWidgetProvider } from "./Advanced3dWidget";

interface Advanced3dState {
  shape: string;
  color: ColorDef;
  sweepType: string;
  decorator: GeometryDecorator;
}

export default class Advanced3d extends React.Component<{}, Advanced3dState> {
  private uiProviders: Advanced3dWidgetProvider;

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.uiProviders = new Advanced3dWidgetProvider(decorator);
    this.state = {
      shape: "Sweeps",
      color: ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)),
      sweepType: "Linear",
      decorator,
    };
  }

  public componentDidMount() {
    this.state.decorator.clearGeometry();
    const polyface = Advanced3dApp.getPolyface(this.state.shape, this.state.sweepType);
    this.state.decorator.setColor(this.state.color);
    this.state.decorator.addGeometry(polyface);
    this.state.decorator.drawBase();
  }

  public componentDidUpdate() {
    this.state.decorator.clearGeometry();
    const polyface = Advanced3dApp.getPolyface(this.state.shape, this.state.sweepType);
    this.state.decorator.setColor(this.state.color);
    this.state.decorator.addGeometry(polyface);
    this.state.decorator.drawBase();
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Sweeps", "Mitered Pipes"]} onChange={(event) => { this.setState({ shape: event.target.value }); }} />
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
        <BlankViewport force2d={false} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

}


