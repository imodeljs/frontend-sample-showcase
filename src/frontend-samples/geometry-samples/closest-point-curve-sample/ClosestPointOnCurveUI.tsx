/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Input, NumericInput, Select } from "@bentley/ui-core";
import ClosestPointOnCurveApp from "./ClosestPointOnCurveApp";
import { CurvePrimitive, LineSegment3d, Point3d } from "@bentley/geometry-core";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { InteractivePointMarker } from "common/GeometryCommon/InteractivePointMarker";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { SampleCurveFactory } from "common/GeometryCommon/SampleCurveFactory";

interface ClosestPointOnCurveState {
  spacePoint: Point3d;
  closePoint: Point3d;
  curveType: string;
  decorator: GeometryDecorator;
}

export default class ClosestPointOnCurveUI extends React.Component<{}, ClosestPointOnCurveState> {
  private spacePointMarker?: InteractivePointMarker;
  private closePointMarker?: InteractivePointMarker;
  private curve?: CurvePrimitive;

  constructor(props?: any) {
    super(props);
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      spacePoint: Point3d.create(),
      closePoint: Point3d.create(),
      curveType: "Rounded Rectangle",
      decorator,
    };
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Curve:</span>
          <Select options={["Rounded Rectangle", "Line String", "Rounded Line String", "Arc", "Elliptical Arc"]} onChange={(event) => { this.setState({ curveType: event.target.value }); }} />

        </div>
        <hr></hr>
        <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 5rem 5rem" }}>
          <span>Space Point:</span>
          <NumericInput value={this.state.spacePoint.x} maxLength={8} precision={2} step={0.1} onChange={(value) => { if (value) this.setSpacePoint({ x: value }); }}></NumericInput>
          <NumericInput value={this.state.spacePoint.y} maxLength={8} precision={2} step={0.1} onChange={(value) => { if (value) this.setSpacePoint({ y: value }); }}></NumericInput>
          <span>Curve Point:</span>
          <Input value={this.state.closePoint.x.toFixed(2)} maxLength={8}></Input>
          <Input value={this.state.closePoint.y.toFixed(2)} maxLength={8}></Input>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Click on the green space point to move it. The program will calculate the closest point on the curve." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

  private setSpacePoint(inPoint: { x?: number, y?: number }) {
    if (!this.curve)
      return;

    const newPoint = this.state.spacePoint.clone();

    if (inPoint.x) newPoint.x = inPoint.x;
    if (inPoint.y) newPoint.y = inPoint.y;

    const closePoint = ClosestPointOnCurveApp.getClosestPointOnCurve(this.curve, newPoint);

    if (closePoint)
      this.setState({ spacePoint: newPoint, closePoint });
  }

  private async createPointMarkers() {
    this.spacePointMarker = new InteractivePointMarker(this.state.spacePoint, "Space Point", ColorDef.green, this.setSpacePoint.bind(this));
    this.closePointMarker = new InteractivePointMarker(this.state.closePoint, "Close Point", ColorDef.blue, () => { });
  }

  public async componentDidMount() {
    this.curve = SampleCurveFactory.createCurvePrimitive(this.state.curveType, 10);
    this.setSpacePoint({ x: -10, y: 10 });
    await this.createPointMarkers();
    this.updateVisualization();
  }

  public componentDidUpdate(_prevProps: any, prevState: ClosestPointOnCurveState) {
    if (prevState.curveType !== this.state.curveType) {
      this.curve = SampleCurveFactory.createCurvePrimitive(this.state.curveType, 10);
      this.setSpacePoint(this.state.spacePoint);
    }
    this.updateVisualization();
  }

  public updateVisualization() {
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    this.state.decorator.clearGeometry();

    if (!this.curve)
      return;

    // Add the curvePrimitive
    this.state.decorator.setColor(ColorDef.black);
    this.state.decorator.setFill(true);
    this.state.decorator.setFillColor(ColorDef.red);
    this.state.decorator.setLineThickness(5);
    this.state.decorator.setLinePixels(LinePixels.Solid);
    this.state.decorator.addGeometry(this.curve);

    // Add the marker representing the space point
    if (this.spacePointMarker) {
      this.spacePointMarker.worldLocation = this.state.spacePoint;
      this.state.decorator.addMarker(this.spacePointMarker);
    }

    // Add the marker representing the point on the curve
    if (this.closePointMarker) {
      this.closePointMarker.worldLocation = this.state.closePoint;
      this.state.decorator.addMarker(this.closePointMarker);
    }

    // Add a line connecting the two points
    this.state.decorator.setColor(ColorDef.black);
    this.state.decorator.setFill(false);
    this.state.decorator.setLineThickness(2);
    this.state.decorator.setLinePixels(LinePixels.Code2);
    this.state.decorator.addLine(LineSegment3d.create(this.state.spacePoint, this.state.closePoint))
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
