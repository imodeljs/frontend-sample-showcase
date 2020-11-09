/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Range3d } from "@bentley/geometry-core";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { NumericInput, Timer } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import { ColorDef } from "@bentley/imodeljs-common";
import SimpleAnimatedApp from "./SimpleAnimatedApp";
import { ConwaysHelpers } from "./ConwaysGameOfLife";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";

export default class SimpleAnimatedUI extends React.Component<{ decorator: GeometryDecorator }, { grid: boolean[][], dimensions: Range3d, timer: Timer, color: ColorDef, clockSpeed: number }> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      grid: ConwaysHelpers.generateGrid(),
      dimensions: new Range3d(-10, -10, 0, 1010, 1010, 0),
      timer: new Timer(100),
      clockSpeed: 100,
      color: ColorDef.fromString("yellow"),
    };
  }

  public componentDidMount() {
    this.setGeometry();
    const newGrid = ConwaysHelpers.updateGrid(this.state.grid);
    this.setState({ grid: newGrid });
    this.state.timer.setOnExecute(this.handleTimer.bind(this));
    this.state.timer.start();
  }

  public componentWillUnmount() {
    this.state.timer.setOnExecute(undefined);
    IModelApp.viewManager.dropDecorator(this.props.decorator);

  }

  public setNewTimer(clockSpeed: number) {
    const timer = new Timer(clockSpeed);
    timer.setOnExecute(this.handleTimer.bind(this));
    timer.start();
    this.setState({ clockSpeed, timer });
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Color:</span>
          <ColorPickerButton initialColor={this.state.color} onColorPick={(color: ColorDef) => { this.setState({ color }); }} />
          <span>Clock Speed(ms):</span>
          <NumericInput defaultValue={this.state.clockSpeed} min={1} onChange={(value) => { if (value) { this.setNewTimer(value); } }}></NumericInput>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="An implementation of Conway's game of life" controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true} sampleSpace={new Range3d(-10, -10, 0, 1010, 1010, 0)}></BlankViewport>
      </>
    );
  }

  public setGeometry() {
    this.props.decorator.clearGeometry();
    this.props.decorator.setColor(ColorDef.white);
    this.props.decorator.setFill(true);
    this.props.decorator.setFillColor(this.state.color);
    this.props.decorator.setLineThickness(2);
    const graphicalGrid = SimpleAnimatedApp.createGridSquares(this.state.grid);
    for (const square of graphicalGrid)
      this.props.decorator.addGeometry(square);

    IModelApp.viewManager.invalidateDecorationsAllViews();
  }

  // We are making use of a timer to consistently render animated geometry
  // Since a viewport only re-renders a frame when it needs or receives new information,
  // We must invalidate the old decorations on every timer tick
  public handleTimer() {
    this.state.timer.start();
    this.setGeometry();
    const newGrid = ConwaysHelpers.updateGrid(this.state.grid);
    this.setState({ grid: newGrid });
  }


}
