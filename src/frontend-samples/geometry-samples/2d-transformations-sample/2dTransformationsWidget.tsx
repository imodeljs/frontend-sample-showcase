/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { Button, NumberInput, Select } from "@bentley/ui-core";
import { Loop, Point3d } from "@bentley/geometry-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import Transformations2dApi from "./2dTransformationsApi";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import "./2dTransformations.scss";

enum Direction {
  Up,
  Down,
  Left,
  Right
}

export const Transformations2dWidget: React.FunctionComponent = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Square");
  const [xTrans, setXTrans] = React.useState<number>(1);
  const [yTrans, setYTrans] = React.useState<number>(1);
  const [rotationDeg, setRotationDeg] = React.useState<number>(180);
  const [geometry, setGeometry] = React.useState<Loop>(Transformations2dApi.generateSquare(Point3d.create(0, 0), 4));
  const [geoUpdate, setGeoUpdate] = React.useState<Boolean>(true);

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new GeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);
    }

    return (() => {
      if (decoratorState)
        IModelApp.viewManager.dropDecorator(decoratorState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geometry && decoratorState) {
      decoratorState.clearGeometry();
      decoratorState.setColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
      decoratorState.setLineThickness(5);
      decoratorState.addGeometry(geometry);
    }
  });

  const generateBaseGeometry = (newShape: string) => {
    if (newShape === "Square") {
      setGeometry(Transformations2dApi.generateSquare(Point3d.create(0, 0), 4));
      setGeoUpdate(!geoUpdate);
    } else if (newShape === "Circle") {
      setGeometry(Transformations2dApi.generateCircle(Point3d.create(0, 0), 4));
    } else if (newShape === "Triangle") {
      setGeometry(Transformations2dApi.generateTriangle(Point3d.create(0, 4, 0), Point3d.create(-5, -2, 0), Point3d.create(5, -2, 0)));
    } else if (newShape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-8, -5, 1));
      points.push(Point3d.create(-6, -3, 1));
      points.push(Point3d.create(-8, 1, 1));
      points.push(Point3d.create(8, -4, 1));
      points.push(Point3d.create(0, 3, 1));
      points.push(Point3d.create(-10, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-4, 3, 1));
      setGeometry(Transformations2dApi.generateConvexHull(points));
    }
  };

  const translateX = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Left)
      newGeometry = Transformations2dApi.handleTranslation(geometry, -xTrans, 0);
    else if (direction === Direction.Right)
      newGeometry = Transformations2dApi.handleTranslation(geometry, xTrans, 0);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  const translateY = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Up)
      newGeometry = Transformations2dApi.handleTranslation(geometry, 0, yTrans);
    else if (direction === Direction.Down)
      newGeometry = Transformations2dApi.handleTranslation(geometry, 0, -yTrans);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  const rotate = (direction: Direction) => {
    let newGeometry;
    if (direction === Direction.Left)
      newGeometry = Transformations2dApi.handleRotation(geometry, rotationDeg);
    else if (direction === Direction.Right)
      newGeometry = Transformations2dApi.handleRotation(geometry, -rotationDeg);

    if (newGeometry)
      setGeometry(newGeometry);

    setGeoUpdate(!geoUpdate);
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          <span>Shape:</span>
          <Select options={["Square", "Circle", "Triangle", "Convex Hull"]} onChange={(event) => { setShape(event.target.value); generateBaseGeometry(event.target.value); }} />
        </div>
        <div className="sample-options-4col" style={{ maxWidth: "350px" }}>
          <span>Translate X</span>
          <NumberInput value={1} onChange={(value) => { if (value) setXTrans(value); }}></NumberInput>
          <Button onClick={() => { translateX(Direction.Left); }}>Shift Left</Button>
          <Button onClick={() => { translateX(Direction.Right); }}>Shift Right</Button>

          <span>Translate Y</span>
          <NumberInput value={1} onChange={(value) => { if (value) setYTrans(value); }}></NumberInput>
          <Button onClick={() => { translateY(Direction.Up); }}>Shift Up</Button>
          <Button onClick={() => { translateY(Direction.Down); }}>Shift Down</Button>

          <span>Rotate:</span>
          <NumberInput value={180} onChange={(value) => { if (value) setRotationDeg(value); }}></NumberInput>
          <Button onClick={() => { rotate(Direction.Left); }}>Rotate Left</Button>
          <Button onClick={() => { rotate(Direction.Right); }}>Rotate Right</Button>

        </div>
        <Button onClick={() => { generateBaseGeometry(shape); }}>Reset</Button>
      </div>
    </>
  );

};

export class Transformations2dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Transformations2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "2dTransformationsWidget",
          label: "2D Transformations Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Transformations2dWidget />,
        }
      );
    }
    return widgets;
  }
}
