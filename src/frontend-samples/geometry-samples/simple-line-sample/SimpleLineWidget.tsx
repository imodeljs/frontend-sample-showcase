/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import SimpleLineApp from "./SimpleLineApp";
import { InteractivePointMarker } from "common/Geometry/InteractivePointMarker";
import { NumberInput } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const SimpleLineWidget: React.FunctionComponent<ControlsWidgetProps> = (ControlsWidgetProps) => {
  const [point1X, setPoint1X] = React.useState<number>(-25);
  const [point1Y, setPoint1Y] = React.useState<number>(-25);
  const [point2X, setPoint2X] = React.useState<number>(20);
  const [point2Y, setPoint2Y] = React.useState<number>(20);

  useEffect(() => {
    _setGeometry();
  });

  const _setGeometry = () => {
    ControlsWidgetProps.decorator.clearGeometry();
    const myLine = SimpleLineApp.createLineSegmentFromXY(point1X, point1Y, point2X, point2Y);
    ControlsWidgetProps.decorator.addGeometry(myLine);
    const fractions = [0.0, 0.1, 0.15, 0.2, 0.25, 0.5, 0.9, 1.0, 1.1];
    const points = SimpleLineApp.createPointsAlongLine(myLine, fractions);
    points.forEach((point, i) => {
      const marker = new InteractivePointMarker(point, `Fraction = ${fractions[i]}`, ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)), () => { });
      ControlsWidgetProps.decorator.addMarker(marker);
    });
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col">
        <span>Point 1 X:</span>
        <NumberInput value={point1X} onChange={(value) => { if (value) setPoint1X(value); }}></NumberInput>
        <span>Point 1 Y:</span>
        <NumberInput value={point1Y} onChange={(value) => { if (value) setPoint1Y(value); }}></NumberInput>
        <span>Point 2 X:</span>
        <NumberInput value={point2X} onChange={(value) => { if (value) setPoint2X(value); }}></NumberInput>
        <span>Point 2 Y:</span>
        <NumberInput value={point2Y} onChange={(value) => { if (value) setPoint2Y(value); }}></NumberInput>
      </div>
    </>
  );
};

export class SimpleLineWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ViewerOnly2dWidget",
          label: "2D View Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SimpleLineWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
