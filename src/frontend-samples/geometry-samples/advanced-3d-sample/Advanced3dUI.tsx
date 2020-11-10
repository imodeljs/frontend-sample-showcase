/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Select } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import Advanced3dApp from "./Advanced3dApp";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";

interface Advanced3dState {
  shape: string;
  color: ColorDef;
  sweepType: string;
  decorator: GeometryDecorator;
}

export default class Advanced3d extends React.Component<{}, Advanced3dState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      shape: "Sweeps",
      color: ColorDef.red,
      sweepType: "Linear",
      decorator,
    };
  }

  public componentDidMount() {
    this.state.decorator.clearGeometry();
    const polyface = Advanced3dApp.getPolyface(this.state.shape, this.state.sweepType);
    this.state.decorator.setColor(this.state.color);
    this.state.decorator.addGeometry(polyface)
    this.state.decorator.drawBase()
  }

  public componentDidUpdate() {
    this.state.decorator.clearGeometry();
    const polyface = Advanced3dApp.getPolyface(this.state.shape, this.state.sweepType);
    this.state.decorator.setColor(this.state.color);
    this.state.decorator.addGeometry(polyface);
    this.state.decorator.drawBase()
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
        <BlankViewport force2d={false} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

}
