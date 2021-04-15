/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { InteractivePointMarker } from "common/Geometry/InteractivePointMarker";
import { Input, NumberInput, Select } from "@bentley/ui-core";
import { CurvePrimitive, LineSegment3d, Point3d } from "@bentley/geometry-core";
import ClosestPointOnCurveApp from "./ClosestPointOnCurveApp";
import { SampleCurveFactory } from "common/Geometry/SampleCurveFactory";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const ClosestPointOnCurveWidget: React.FunctionComponent<ControlsWidgetProps> = (props: ControlsWidgetProps) => {
  const [spacePoint, setSpacePoint] = React.useState<Point3d>(Point3d.create(-10, 10));
  const [closePoint, setClosePoint] = React.useState<Point3d>(Point3d.create());
  const [curveType, setCurveType] = React.useState<string>("Rounded Rectangle");
  const [spacePointMarker, setSpacePointMarker] = React.useState<InteractivePointMarker | undefined>();
  const [closePointMarker, setClosePointMarker] = React.useState<InteractivePointMarker | undefined>();
  const [curve, setCurve] = React.useState<CurvePrimitive | undefined>();

  useEffect(() => {
    setCurve(SampleCurveFactory.createCurvePrimitive(curveType, 10));
  }, [curveType]);

  useEffect(() => {
    calculateSpacePoint(spacePoint);
  }, [curve]);

  useEffect(() => {
    calculateSpacePoint(spacePoint);
  }, [spacePointMarker]);

  useEffect(() => {
    if (curve) {
      const newClosePoint = ClosestPointOnCurveApp.getClosestPointOnCurve(curve, spacePoint);
      if (newClosePoint)
        setClosePoint(newClosePoint);
      updateVisualization();
    }
  }, [spacePoint]);

  useEffect(() => {
    setCurve(SampleCurveFactory.createCurvePrimitive(curveType, 10));
    calculateSpacePoint({ x: -10, y: 10 });
    createPointMarkers();
    updateVisualization();

  }, []);

  const createPointMarkers = () => {
    setSpacePointMarker(new InteractivePointMarker(spacePoint, "Space Point", ColorDef.green, (pt: Point3d) => setSpacePoint(pt)));
    setClosePointMarker(new InteractivePointMarker(closePoint, "Close Point", ColorDef.blue, () => { }));
  };

  const calculateSpacePoint = (inPoint: { x?: number, y?: number }) => {
    if (!curve)
      return;

    const newPoint = spacePoint.clone();

    if (inPoint.x) newPoint.x = inPoint.x;
    if (inPoint.y) newPoint.y = inPoint.y;

    const newClosePoint = ClosestPointOnCurveApp.getClosestPointOnCurve(curve, newPoint);

    if (closePoint && newClosePoint) {
      setSpacePoint(newPoint);
      setClosePoint(newClosePoint);
    }
  }

  const updateVisualization = () => {
    // This function updates the decorator which draws the geometry in the view.  We call this when this
    // component is first mounted and then any time component's state is changed.
    props.decorator.clearGeometry();

    if (!curve)
      return;

    // Add the curvePrimitive
    props.decorator.setColor(ColorDef.black);
    props.decorator.setFill(true);
    props.decorator.setFillColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
    props.decorator.setLineThickness(5);
    props.decorator.setLinePixels(LinePixels.Solid);
    props.decorator.addGeometry(curve);

    // Add the marker representing the space point
    if (spacePointMarker) {
      spacePointMarker.worldLocation = spacePoint;
      props.decorator.addMarker(spacePointMarker);
    }

    // Add the marker representing the point on the curve
    if (closePointMarker) {
      closePointMarker.worldLocation = closePoint;
      props.decorator.addMarker(closePointMarker);
    }

    // Add a line connecting the two points
    props.decorator.setColor(ColorDef.black);
    props.decorator.setFill(false);
    props.decorator.setLineThickness(2);
    props.decorator.setLinePixels(LinePixels.Code2);
    props.decorator.addLine(LineSegment3d.create(spacePoint, closePoint));
  }

  return (
    <>
      <div className="sample-options-2col">
        <span>Curve:</span>
        <Select options={["Rounded Rectangle", "Line String", "Rounded Line String", "Arc", "Elliptical Arc"]} onChange={(event) => { setCurveType(event.target.value); }} />

      </div>
      <hr></hr>
      <div className="sample-options-3col" style={{ gridTemplateColumns: "1fr 5rem 5rem" }}>
        <span>Space Point:</span>
        <NumberInput value={spacePoint.x} maxLength={8} precision={2} step={0.1} onChange={(value) => { if (value) calculateSpacePoint({ x: value }); }}></NumberInput>
        <NumberInput value={spacePoint.y} maxLength={8} precision={2} step={0.1} onChange={(value) => { if (value) calculateSpacePoint({ y: value }); }}></NumberInput>
        <span>Curve Point:</span>
        <Input value={closePoint.x.toFixed(2)} maxLength={8}></Input>
        <Input value={closePoint.y.toFixed(2)} maxLength={8}></Input>
      </div>
    </>
  );

};



export class ClosestPointOnCurveWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClosestPointOnCurveWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ClosestPointOnCurveWidget",
          label: "Closest Point On Curve",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClosestPointOnCurveWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
