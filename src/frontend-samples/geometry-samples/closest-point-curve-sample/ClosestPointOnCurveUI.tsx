/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Input, NumericInput, Select } from "@bentley/ui-core";
import ClosestPointOnCurveApp from "./ClosestPointOnCurveApp";
import { CurveChain, LineSegment3d, Point3d } from "@bentley/geometry-core";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { InteractivePointMarker } from "common/InteractivePointMarker";

interface ClosestPointOnCurveState {
  spacePoint: Point3d;
  closePoint: Point3d;
  curveType: string;
}

export default class ClosestPointOnCurveUI extends React.Component<{}, ClosestPointOnCurveState> {
  private spacePointMarker?: InteractivePointMarker;
  private closePointMarker?: InteractivePointMarker;
  private curveChain?: CurveChain;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      spacePoint: Point3d.create(),
      closePoint: Point3d.create(),
      curveType: "Rounded Rectangle",
    };
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Curve:</span>
          <Select options={["Rounded Rectangle", "Line String", "Rounded Line String"]} onChange={(event) => { this.setState({ curveType: event.target.value }); }} />

        </div>
        <hr></hr>
        <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <span>Space Point:</span>
          <NumericInput style={{ width: "5em" }} value={this.state.spacePoint.x} maxLength={8} precision={2} step={10} onChange={(value) => { if (value) this.setSpacePoint({ x: value }); }}></NumericInput>
          <NumericInput style={{ width: "5em" }} value={this.state.spacePoint.y} maxLength={8} precision={2} step={10} onChange={(value) => { if (value) this.setSpacePoint({ y: value }); }}></NumericInput>
          <span>Curve Point:</span>
          <Input style={{ width: "5em" }} value={this.state.closePoint.x.toFixed(2)} maxLength={8}></Input>
          <Input style={{ width: "5em" }} value={this.state.closePoint.y.toFixed(2)} maxLength={8}></Input>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Click on the green space point to move it. The program will calculate the closest point on the curve." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  private setSpacePoint(inPoint: { x?: number, y?: number }) {
    if (!this.curveChain)
      return;

    const newPoint = this.state.spacePoint.clone();

    if (inPoint.x) newPoint.x = inPoint.x;
    if (inPoint.y) newPoint.y = inPoint.y;

    const closePoint = ClosestPointOnCurveApp.getClosestPointOnCurve(this.curveChain, newPoint);

    if (closePoint)
      this.setState({ spacePoint: newPoint, closePoint });
  }

  private async createPointMarkers() {
    this.spacePointMarker = new InteractivePointMarker(this.state.spacePoint, "Space Point", ColorDef.green, this.setSpacePoint.bind(this));
    this.closePointMarker = new InteractivePointMarker(this.state.closePoint, "Close Point", ColorDef.blue, () => { });
  }

  public async componentDidMount() {
    this.curveChain = ClosestPointOnCurveApp.createPath(this.state.curveType);
    this.setSpacePoint({ x: 400, y: 1000 });
    await this.createPointMarkers();
    this.updateVisualization();
  }

  public componentDidUpdate(_prevProps: any, prevState: ClosestPointOnCurveState) {
    if (prevState.curveType !== this.state.curveType) {
      this.curveChain = ClosestPointOnCurveApp.createPath(this.state.curveType);
      this.setSpacePoint(this.state.spacePoint);
    }
    this.updateVisualization();
  }

  public updateVisualization() {
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    BlankViewport.decorator.clearGeometry();

    if (!this.curveChain)
      return;

    // Add the curvechain
    BlankViewport.decorator.setColor(ColorDef.white);
    BlankViewport.decorator.setFill(true);
    BlankViewport.decorator.setFillColor(ColorDef.red);
    BlankViewport.decorator.setLineThickness(5);
    BlankViewport.decorator.setLinePixels(LinePixels.Solid);
    BlankViewport.decorator.addGeometry(this.curveChain);

    // Add the marker representing the space point
    if (this.spacePointMarker) {
      this.spacePointMarker.worldLocation = this.state.spacePoint;
      BlankViewport.decorator.addMarker(this.spacePointMarker);
    }

    // Add the marker representing the point on the curve
    if (this.closePointMarker) {
      this.closePointMarker.worldLocation = this.state.closePoint;
      BlankViewport.decorator.addMarker(this.closePointMarker);
    }

    // Add a line connecting the two points
    BlankViewport.decorator.setColor(ColorDef.black);
    BlankViewport.decorator.setFill(false);
    BlankViewport.decorator.setLineThickness(2);
    BlankViewport.decorator.setLinePixels(LinePixels.Code2);
    BlankViewport.decorator.addLine(LineSegment3d.create(this.state.spacePoint, this.state.closePoint))
  }

}

