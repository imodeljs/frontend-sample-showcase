/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { NumericInput } from "@bentley/ui-core";
import SimpleLineApp from "./SimpleLineApp";

interface SimpleLineState {
  point1X: number;
  point1Y: number;
  point2X: number;
  point2Y: number;
}

export default class SimpleLine extends React.Component<{}, SimpleLineState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      point1X: 140,
      point1Y: 25,
      point2X: 680,
      point2Y: 800,
    };
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Point 1 X:</span>
          <NumericInput defaultValue={this.state.point1X} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point1X: value }); }}></NumericInput>
          <span>Point 1 Y:</span>
          <NumericInput defaultValue={this.state.point1Y} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point1Y: value }); }}></NumericInput>
          <span>Point 2 X:</span>
          <NumericInput defaultValue={this.state.point2X} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point2X: value }); }}></NumericInput>
          <span>Point 2 Y:</span>
          <NumericInput defaultValue={this.state.point2Y} min={0} max={1000} onChange={(value) => { if (value) this.setState({ point2Y: value }); }}></NumericInput>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Creating a line segments and some points along it" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public componentDidMount() {
    SimpleLineApp.setGeometry(this.state);
  }

  public componentDidUpdate() {
    SimpleLineApp.setGeometry(this.state);
  }

}
