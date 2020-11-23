/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { NumericInput, Slider } from "@bentley/ui-core";
import CurveFractionApp from "./CurveFractionApp";
import { SampleCurveFactory } from "common/GeometryCommon/SampleCurveFactory";
import { InteractivePointMarker } from "common/GeometryCommon/InteractivePointMarker";
import { CurvePrimitive, LineSegment3d, LineString3d, Loop, Point3d, Vector3d } from "@bentley/geometry-core";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";

interface CurveData {
  curve: CurvePrimitive;
  curvePointMarker: InteractivePointMarker;
  derivativeAtPoint: Vector3d;
}

interface CurveFractionState {
  fraction: number;
  decorator: GeometryDecorator;
}

export default class CurveFractionUI extends React.Component<{}, CurveFractionState> {
  private curveData: CurveData[] = [];

  constructor(props?: any) {
    super(props);
    const initialFraction = 0.5;
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    this.state = {
      fraction: initialFraction,
      decorator,
    };
  }

  private createCurves(fraction: number) {
    this.curveData = [];

    const size = 10;
    const shift = 10;

    let curve = SampleCurveFactory.createCurvePrimitive("Step Line String", size)!;
    curve.tryTranslateInPlace(shift, -shift, 0);
    let ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    let marker = new InteractivePointMarker(ray.origin, "Step Line String", ColorDef.green, async (pt: Point3d) => this.setCurvePoint(pt, 0));
    this.curveData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Half Step Line String", size)!;
    curve.tryTranslateInPlace(shift, shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Half Step Line String", ColorDef.green, async (pt: Point3d) => this.setCurvePoint(pt, 1));
    this.curveData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Arc", size)!;
    curve.tryTranslateInPlace(-shift, -shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Arc", ColorDef.green, async (pt: Point3d) => this.setCurvePoint(pt, 2));
    this.curveData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Elliptical Arc", size)!;
    curve.tryTranslateInPlace(-shift, shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Elliptical Arc", ColorDef.green, async (pt: Point3d) => this.setCurvePoint(pt, 3));
    this.curveData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Line Segment Flat Diagonal", size * 3)!;
    curve.tryTranslateInPlace(0, shift * 2, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Line Segment", ColorDef.green, async (pt: Point3d) => this.setCurvePoint(pt, 4));
    this.curveData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });
  }

  public getControls() {
    return (
      <>
        <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 5rem 5rem" }}>
          <span>Fraction:</span>

          <Slider min={0} max={1} values={[this.state.fraction]} step={.01} showTooltip onUpdate={(value) => { if (value) this.setFraction(value[0]); }} />
          <NumericInput value={this.state.fraction} maxLength={8} precision={2} step={0.01} onChange={(value) => { if (null !== value) this.setFraction(value); }}></NumericInput>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Use the slider below or click on one of the green points to adjust the fraction and see how the points move along each path." controls={this.getControls()}></ControlPane>
        <BlankViewport force2d={true} grid={true} sampleSpace={undefined}></BlankViewport>
      </>
    );
  }

  private setFraction(fraction: number) {
    this.setState({ fraction });
  }

  private async setCurvePoint(inPoint: Point3d, index: number) {
    if (this.curveData.length <= index)
      return;

    const fraction = CurveFractionApp.getFractionFromPoint(this.curveData[index].curve, inPoint);

    if (fraction)
      this.setFraction(fraction);
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

  public async componentDidMount() {
    this.setFraction(0.5);
    this.createCurves(0.5);
    this.updateVisualization();
  }

  public componentDidUpdate(_prevProps: any, prevState: CurveFractionState) {
    if (prevState.fraction !== this.state.fraction) {
      this.curveData.forEach((curveData) => {
        const ray = CurveFractionApp.fractionToPointAndDerivative(curveData.curve, this.state.fraction)!;
        curveData.curvePointMarker.worldLocation = ray.origin;
        curveData.derivativeAtPoint = ray.direction;
      })
    }
    this.updateVisualization();
  }

  public updateVisualization() {
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    this.state.decorator.clearGeometry();

    this.curveData.forEach((curveData) => {
      const curve = curveData.curve;
      const marker = curveData.curvePointMarker;
      const curvePoint = marker.worldLocation;
      const derivative = curveData.derivativeAtPoint;

      // Add the curvePrimitive
      this.state.decorator.setColor(ColorDef.white);
      this.state.decorator.setFill(false);
      this.state.decorator.setLineThickness(5);
      this.state.decorator.setLinePixels(LinePixels.Solid);
      this.state.decorator.addGeometry(curve);

      // Add the marker representing the curve point
      this.state.decorator.addMarker(marker);

      // Add an arrow representing the derivative
      const arrowEnd = curvePoint.plusScaled(derivative, 0.2);

      this.state.decorator.setColor(ColorDef.green);
      this.state.decorator.setFill(false);
      this.state.decorator.setLineThickness(2);
      this.state.decorator.addLine(LineSegment3d.create(curvePoint, arrowEnd)); // stem of the arrow

      const normalized = derivative.normalize()!;
      const onStem = arrowEnd.plusScaled(normalized, -1.0);
      const perpendicular = normalized.crossProduct(Vector3d.unitZ());

      const triangle = [
        arrowEnd.clone(),
        onStem.plusScaled(perpendicular, 0.5),
        onStem.plusScaled(perpendicular, -0.5),
      ]
      const linestring = LineString3d.create(triangle);
      const loop = Loop.create(linestring.clone());

      this.state.decorator.setLineThickness(0);
      this.state.decorator.addGeometry(loop); // point of the arrow
    });
  }

}
