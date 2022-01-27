/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { Slider, Toggle } from "@itwin/core-react";
import { Point3d, Range2d } from "@itwin/core-geometry";
import { PointSelector } from "common/PointSelector/PointSelector";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import HeatmapDecoratorApi from "./HeatmapDecoratorApi";
import { useActiveViewport } from "@itwin/appui-react";
import "./HeatmapDecorator.scss";

export const HeatmapDecoratorWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [showDecoratorState, setShowDecoratorState] = React.useState<boolean>(true);
  const [spreadFactorState, setSpreadFactorState] = React.useState<number>(10);
  const [pointsState, setPointsState] = React.useState<Point3d[]>([]);
  const [rangeState, setRangeState] = React.useState<Range2d>(Range2d.createNull());

  useEffect(() => {
    if (viewport) {

      // Grab range of the contents of the view. We'll use this to size the heatmap.
      const range3d = viewport.view.computeFitRange();
      const range = Range2d.createFrom(range3d);

      // We'll draw the heatmap as an overlay in the center of the view's Z extents.
      const height = range3d.high.interpolate(0.5, range3d.low).z;

      HeatmapDecoratorApi.disableDecorations();
      HeatmapDecoratorApi.decorator = undefined;
      HeatmapDecoratorApi.setupDecorator(pointsState, range, spreadFactorState, height);
      if (showDecoratorState) {
        HeatmapDecoratorApi.enableDecorations();
      }

      setRangeState(range);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  // Effect when the points get updated
  useEffect(() => {
    if (HeatmapDecoratorApi.decorator)
      HeatmapDecoratorApi.decorator.setPoints(pointsState);
  }, [pointsState]);

  useEffect(() => {
    if (HeatmapDecoratorApi.decorator)
      HeatmapDecoratorApi.decorator.setSpreadFactor(spreadFactorState);
  }, [spreadFactorState]);

  useEffect(() => {
    if (showDecoratorState)
      HeatmapDecoratorApi.enableDecorations();
    else
      HeatmapDecoratorApi.disableDecorations();
  }, [showDecoratorState]);

  const _onPointsChanged = (p: Point3d[]) => {
    setPointsState(p);
  };

  const _onChangeSpreadFactor = (values: readonly number[]) => {
    setSpreadFactorState(values[0]);
  };

  const _onChangeShowHeatmap = (checked: boolean) => {
    setShowDecoratorState(checked);
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Show Heatmap</span>
          <Toggle isOn={showDecoratorState} onChange={_onChangeShowHeatmap} />
          <PointSelector onPointsChanged={_onPointsChanged} range={rangeState} />
          <span>Spread Factor</span>
          <Slider min={0} max={100} values={[spreadFactorState]} step={1} onUpdate={_onChangeSpreadFactor} />
        </div>
      </div>
    </>
  );
};

export class HeatmapDecoratorWidgetProvider implements UiItemsProvider {
  public readonly id: string = "HeatmapDecoratorWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "HeatmapDecoratorWidget",
          label: "Heatmap Decorator Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <HeatmapDecoratorWidget />,
        },
      );
    }
    return widgets;
  }

}
