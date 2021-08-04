/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { NumberInput, Slider } from "@bentley/ui-core";
import { CurvePrimitive, LineSegment3d, LineString3d, Loop, Point3d, Vector3d } from "@bentley/geometry-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import CurveFractionApi from "./CurveFractionApi";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { SampleCurveFactory } from "./SampleCurveFactory";
import { InteractivePointMarker, MovePointTool } from "./InteractivePointMarker";
import "./CurveFraction.scss";

interface CurveData {
  curve: CurvePrimitive;
  curvePointMarker: InteractivePointMarker;
  derivativeAtPoint: Vector3d;
}

export const CurveFractionWidget: React.FunctionComponent = () => {

  const createCurves = () => {
    const size = 10;
    const shift = 10;

    const initCurvesData: CurveData[] = [];
    let curve = SampleCurveFactory.createCurvePrimitive("Step Line String", size)!;
    curve.tryTranslateInPlace(shift, -shift, 0);
    let ray = CurveFractionApi.fractionToPointAndDerivative(curve, fraction)!;
    let marker = new InteractivePointMarker(ray.origin, "Step Line String", ColorDef.green, (pt: Point3d) => setCurvePoint(pt, 0, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Half Step Line String", size)!;
    curve.tryTranslateInPlace(shift, shift, 0);
    ray = CurveFractionApi.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Half Step Line String", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 1, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Arc", size)!;
    curve.tryTranslateInPlace(-shift, -shift, 0);
    ray = CurveFractionApi.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Arc", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 2, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Elliptical Arc", size)!;
    curve.tryTranslateInPlace(-shift, shift, 0);
    ray = CurveFractionApi.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Elliptical Arc", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 3, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });

    curve = SampleCurveFactory.createCurvePrimitive("Line Segment Flat Diagonal", size * 3)!;
    curve.tryTranslateInPlace(0, shift * 2, 0);
    ray = CurveFractionApi.fractionToPointAndDerivative(curve, fraction)!;
    marker = new InteractivePointMarker(ray.origin, "Line Segment", ColorDef.green, async (pt: Point3d) => setCurvePoint(pt, 4, curvesData));
    initCurvesData.push({ curve, curvePointMarker: marker, derivativeAtPoint: ray.direction });
    return initCurvesData;
  };

  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [fraction, setFraction] = React.useState<number>(0.5);
  const [curvesData] = React.useState<CurveData[]>(createCurves());

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new GeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);

      const sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
      MovePointTool.register(sampleNamespace);
    }

    return (() => {
      if (decoratorState) {
        IModelApp.viewManager.dropDecorator(decoratorState);
        IModelApp.tools.unRegister(MovePointTool.toolId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    curvesData.forEach((curveData) => {
      const ray = CurveFractionApi.fractionToPointAndDerivative(curveData.curve, fraction)!;
      curveData.curvePointMarker.worldLocation = ray.origin;
      curveData.derivativeAtPoint = ray.direction;
    });
  }, [fraction, curvesData]);

  useEffect(() => {
    if (!decoratorState)
      return;

    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    decoratorState.clearGeometry();

    curvesData.forEach((curveData) => {
      const curve = curveData.curve;
      const marker = curveData.curvePointMarker;
      const curvePoint = marker.worldLocation;
      const derivative = curveData.derivativeAtPoint;

      // Add the curvePrimitive
      decoratorState.setColor(ColorDef.white);
      decoratorState.setFill(false);
      decoratorState.setLineThickness(5);
      decoratorState.setLinePixels(LinePixels.Solid);
      decoratorState.addGeometry(curve);

      // Add the marker representing the curve point
      decoratorState.addMarker(marker);

      // Add an arrow representing the derivative
      const arrowEnd = curvePoint.plusScaled(derivative, 0.2);

      decoratorState.setColor(ColorDef.green);
      decoratorState.setFill(false);
      decoratorState.setLineThickness(2);
      decoratorState.addLine(LineSegment3d.create(curvePoint, arrowEnd)); // stem of the arrow

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

      decoratorState.setLineThickness(0);
      decoratorState.addGeometry(loop); // point of the arrow
    });
  }, [decoratorState, fraction, curvesData]);

  const setCurvePoint = (inPoint: Point3d, index: number, curveData: CurveData[]) => {
    if (curvesData.length <= index)
      return;

    const newFraction = CurveFractionApi.getFractionFromPoint(curveData[index].curve, inPoint);

    if (newFraction)
      setFraction(newFraction);
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 5rem 5rem" }}>
          <span>Fraction:</span>

          <Slider min={0} max={1} values={[fraction]} step={.01} showTooltip onUpdate={(value) => { if (value) setFraction(value[0]); }} />
          <NumberInput value={fraction} maxLength={8} precision={2} step={0.01} onChange={(value) => { if (value) setFraction(value); }}></NumberInput>
        </div>
      </div>
    </>
  );

};

export class CurveFractionWidgetProvider implements UiItemsProvider {
  public readonly id: string = "CurveFractionWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "CurveFractionWidget",
          label: "Curve Fraction Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <CurveFractionWidget />,
        }
      );
    }
    return widgets;
  }
}
