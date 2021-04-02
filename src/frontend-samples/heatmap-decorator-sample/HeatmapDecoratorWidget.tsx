/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Slider, Toggle } from "@bentley/ui-core";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { PointSelector } from "common/PointSelector/PointSelector";

export interface HeatmapDecoratorWidgetProps {
  showDecorator: boolean;
  range: Range2d;
  spreadFactor: number;
  points: Point3d[];
  setSpreadFactor: (spreadFactor: number) => void;
  setPoints: (points: Point3d[]) => void;
  onToggleShowDecorator: (showDecorator: boolean) => void;
}

export const HeatmapDecoratorWidget: React.FunctionComponent<HeatmapDecoratorWidgetProps> = ({ showDecorator, range, spreadFactor, points, setSpreadFactor, setPoints, onToggleShowDecorator }) => {
  const [showDecoratorState, setShowDecoratorState] = React.useState<boolean>(true);
  const [spreadFactorState, setSpreadFactorState] = React.useState<number>(spreadFactor);
  const [pointsState, setPointsState] = React.useState<Point3d[]>(points);

  // Effect when the points get updated
  useEffect(() => {
    setPoints(pointsState);
  }, [pointsState, setPoints]);

  useEffect(() => {
    setSpreadFactor(spreadFactorState);
  }, [setSpreadFactor, spreadFactorState]);

  useEffect(() => {
    onToggleShowDecorator(showDecoratorState);
  }, [onToggleShowDecorator, showDecorator, showDecoratorState]);

  const _onPointsChanged = (p: Point3d[]) => {
    setPointsState(p);
  };

  const _onChangeSpreadFactor = (values: readonly number[]) => {
    setSpreadFactorState(values[0]);
  };

  const _onChangeShowHeatmap = (checked: boolean) => {
    setShowDecoratorState(checked);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col">
        <span>Show Heatmap</span>
        <Toggle isOn={showDecoratorState} onChange={_onChangeShowHeatmap} />
        <PointSelector onPointsChanged={_onPointsChanged} range={range} />
        <span>Spread Factor</span>
        <Slider min={0} max={100} values={[spreadFactorState]} step={1} onUpdate={_onChangeSpreadFactor} />
      </div>
    </>
  );
};
