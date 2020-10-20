/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Loop } from "@bentley/geometry-core";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Button, NumericInput, Select } from "@bentley/ui-core";
import Transformations2dApp from "./2dTransformationsApp";

interface TransformationState {
  shape: string;
  color: ColorDef;
  xTrans: number;
  yTrans: number;
  rotationDeg: number;
  geometry: Loop | undefined;
}

export default class Transformations2dUI extends React.Component<{}, TransformationState> {

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

  public componentDidUpdate() {
    if (this.state.geometry)
      Transformations2dApp.setGeometry(this.state.geometry);
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          <span>Shape:</span>
          <Select options={["Square", "Circle", "Triangle", "Convex Hull"]} onChange={(event) => { this.setState({ shape: event.target.value }); const newGeo = Transformations2dApp.generateBaseGeometry(event.target.value); this.setState({ geometry: newGeo }); }} />
        </div>
        <div className="sample-options-4col" style={{ maxWidth: "350px" }}>
          <span>Translate X</span>
          <NumericInput defaultValue={100} onChange={(value) => { if (value) this.setState({ xTrans: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleLeftXTranslation(this.state); }}>Shift Left</Button>
          <Button onClick={() => { Transformations2dApp.handleRightXTranslation(this.state); }}>Shift Right</Button>

          <span>Translate Y</span>
          <NumericInput defaultValue={100} onChange={(value) => { if (value) this.setState({ yTrans: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleUpYTranslation(this.state); }}>Shift Up</Button>
          <Button onClick={() => { Transformations2dApp.handleDownYTranslation(this.state); }}>Shift Down</Button>

          <span>Rotate:</span>
          <NumericInput defaultValue={180} onChange={(value) => { if (value) this.setState({ rotationDeg: value }); }}></NumericInput>
          <Button onClick={() => { Transformations2dApp.handleLeftRotation(this.state); }}>Rotate Left</Button>
          <Button onClick={() => { Transformations2dApp.handleRightRotation(this.state); }}>Rotate Right</Button>

        </div>
        <Button onClick={() => { const newGeo = Transformations2dApp.generateBaseGeometry(this.state.shape); this.setState({ geometry: newGeo }); }}>Reset</Button>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Select a shape, and apply transformations to it." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    const newGeo = Transformations2dApp.generateBaseGeometry(this.state.shape);
    this.setState({
      geometry: newGeo,
    });
  }

}
