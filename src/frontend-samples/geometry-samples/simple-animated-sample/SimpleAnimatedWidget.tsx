/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorDef } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { NumberInput, Timer } from "@bentley/ui-core";
import { ConwaysHelpers } from "./ConwaysGameOfLife";
import SimpleAnimatedApp from "./SimpleAnimatedApp";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorPickerButton } from "@bentley/ui-components";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const SimpleAnimatedWidget: React.FunctionComponent<ControlsWidgetProps> = (props: ControlsWidgetProps) => {
  const [grid, setGrid] = React.useState<boolean[][]>(ConwaysHelpers.generateGrid());
  const [timer, setTimer] = React.useState<Timer>(new Timer(100));
  const [clockSpeed, setClockSpeed] = React.useState<number>(100);
  const [color, setColor] = React.useState<ColorDef>(ColorDef.fromString("yellow"));

  useEffect(() => {
    _setGeometry(grid, color);
  });

  useEffect(() => {
    timer.setOnExecute(() => { handleTimer(grid, color, timer); });
    timer.start();
    return () => {
      timer.stop();
      timer.setOnExecute(() => { });
    };
  }, [color]);

  const _setGeometry = (newGrid: boolean[][], fillColor: ColorDef) => {
    props.decorator.clearGeometry();
    props.decorator.setColor(ColorDef.white);
    props.decorator.setFill(true);
    props.decorator.setFillColor(fillColor);
    props.decorator.setLineThickness(2);
    const graphicalGrid = SimpleAnimatedApp.createGridSquares(newGrid);
    for (const square of graphicalGrid)
      props.decorator.addGeometry(square);

    IModelApp.viewManager.invalidateDecorationsAllViews();
  };

  const setNewTimer = (newClockSpeed: number, oldGrid: boolean[][], fillColor: ColorDef, oldTimer: Timer) => {
    oldTimer.stop();
    oldTimer.setOnExecute(() => { });
    const newTimer = new Timer(newClockSpeed);
    newTimer.setOnExecute(() => { handleTimer(oldGrid, fillColor, newTimer); });
    newTimer.start();
    setClockSpeed(newClockSpeed);
    setTimer(newTimer);
  };

  // We are making use of a timer to consistently render animated geometry
  // Since a viewport only re-renders a frame when it needs or receives new information,
  // We must invalidate the old decorations on every timer tick
  const handleTimer = (oldGrid: boolean[][], fillColor: ColorDef, oldTimer: Timer) => {
    const newGrid = ConwaysHelpers.updateGrid(oldGrid);
    _setGeometry(newGrid, fillColor);
    oldTimer.setOnExecute(() => { handleTimer(newGrid, fillColor, oldTimer); });
    oldTimer.start();
    setGrid(newGrid);
  };

  return (
    <>
      <div className="sample-options-2col">
        <span>Color:</span>
        <ColorPickerButton initialColor={color} onColorPick={(newColor: ColorDef) => { setColor(newColor); }} />
        <span>Clock Speed(ms):</span>
        <NumberInput value={clockSpeed} min={1} onChange={(value) => { if (value) { setNewTimer(value, grid, color, timer); } }}></NumberInput>
      </div>
    </>
  );

};

export class SimpleAnimatedWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SimpleAnimatedWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "SimpleAnimatedWidget",
          label: "Simple Animated",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SimpleAnimatedWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
