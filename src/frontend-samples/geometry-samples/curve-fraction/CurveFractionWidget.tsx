/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { InteractivePointMarker } from "common/Geometry/InteractivePointMarker";
import { NumberInput, Slider } from "@bentley/ui-core";
import { CurvePrimitive, LineSegment3d, LineString3d, Loop, Point3d, Vector3d } from "@bentley/geometry-core";
import { SampleCurveFactory } from "common/Geometry/SampleCurveFactory";
import CurveFractionApp from "./CurveFractionApp";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

interface CurveData {
  curve: CurvePrimitive;
  curvePointMarker: InteractivePointMarker;
  derivativeAtPoint: Vector3d;
}

export const CurveFractionWidget: React.FunctionComponent<ControlsWidgetProps> = (props: ControlsWidgetProps) => {
  const [fraction, setFraction] = React.useState<number>(0.5);

  const createCurves = () => {
    const size = 10;
    const shift = 10;

    const initCurvesData: CurveData[] = []
    let curve = SampleCurveFactory.createCurvePrimitive("Step Line String", size)!;
    curve.tryTranslateInPlace(shift, -shift, 0);
    let ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    let marker = new InteractivePointMarker(ray.origin, "Step Line String", ColorDef.green, (pt: Point3d) => setCurvePoint(pt, 0, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Half Step Line String", size)!;
    curve.tryTranslateInPlace(shift, shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Half Step Line String", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 1, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Arc", size)!;
    curve.tryTranslateInPlace(-shift, -shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Arc", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 2, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Elliptical Arc", size)!;
    curve.tryTranslateInPlace(-shift, shift, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Elliptical Arc", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 3, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Line Segment Flat Diagonal", size * 3)!;
    curve.tryTranslateInPlace(0, shift * 2, 0);
    ray = CurveFractionApp.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Line Segment", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 4, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });
    return initCurvesData;
  };

  const [curvesData] = React.useState<CurveData[]>(createCurves());

  useEffect(() => {
    updateVisualization();
  }, []);

  useEffect(() => {
    curvesData.forEach((curveData) => {
      const ray = CurveFractionApp.fractionToPointAndDerivative(curveData.curve, fraction)!;
      curveData.curvePointMarker.worldLocation = ray.origin;
      curveData.derivativeAtPoint = ray.direction;
    });
    updateVisualization();
  }, [fraction, curvesData]);

  const setCurvePoint = (inPoint: Point3d, index: number, curveData: CurveData[]) => {
    if (curvesData.length <= index)
      return;

    const newFraction = CurveFractionApp.getFractionFromPoint(curveData[index].curve, inPoint);

    if (newFraction)
      setFraction(newFraction);
  }

  const updateVisualization = () => {
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    props.decorator.clearGeometry();

    curvesData.forEach((curveData) => {
      const curve = curveData.curve;
      const marker = curveData.curvePointMarker;
      const curvePoint = marker.worldLocation;
      const derivative = curveData.derivativeAtPoint;

      // Add the curvePrimitive
      props.decorator.setColor(ColorDef.white);
      props.decorator.setFill(false);
      props.decorator.setLineThickness(5);
      props.decorator.setLinePixels(LinePixels.Solid);
      props.decorator.addGeometry(curve);

      // Add the marker representing the curve point
      props.decorator.addMarker(marker);

      // Add an arrow representing the derivative
      const arrowEnd = curvePoint.plusScaled(derivative, 0.2);

      props.decorator.setColor(ColorDef.green);
      props.decorator.setFill(false);
      props.decorator.setLineThickness(2);
      props.decorator.addLine(LineSegment3d.create(curvePoint, arrowEnd)); // stem of the arrow

      const normalized = derivative.normalize()!;
      const onStem = arrowEnd.plusScaled(normalized, -1.0);
      const perpendicular = normalized.crossProduct(Vector3d.unitZ());

      const triangle = [
        arrowEnd.clone(),
        onStem.plusScaled(perpendicular, 0.5),
        onStem.plusScaled(perpendicular, -0.5),
      ];
      const linestring = LineString3d.create(triangle);
      const loop = Loop.create(linestring.clone());

      props.decorator.setLineThickness(0);
      props.decorator.addGeometry(loop); // point of the arrow
    });
  };

  return (
    <>
      <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 5rem 5rem" }}>
        <span>Fraction:</span>

        <Slider min={0} max={1} values={[fraction]} step={.01} showTooltip onUpdate={(value) => { if (value) setFraction(value[0]); }} />
        <NumberInput value={fraction} maxLength={8} precision={2} step={0.01} onChange={(value) => { if (value) setFraction(value); }}></NumberInput>
      </div>
    </>
  );

};

export class CurveFractionWidgetProvider implements UiItemsProvider {
  public readonly id: string = "CurveFractionWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "CurveFractionWidget",
          label: "Curve Fraction",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <CurveFractionWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
