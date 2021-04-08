/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Slider, Toggle } from "@bentley/ui-core";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { PointSelector } from "common/PointSelector/PointSelector";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import HeatmapDecoratorApp from "./HeatmapDecoratorApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { IModelApp } from "@bentley/imodeljs-frontend";

export const HeatmapDecoratorWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [showDecoratorState, setShowDecoratorState] = React.useState<boolean>(true);
  const [spreadFactorState, setSpreadFactorState] = React.useState<number>(10);
  const [pointsState, setPointsState] = React.useState<Point3d[]>([]);
  const [rangeState, setRangeState] = React.useState<Range2d>(Range2d.createNull());

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        // Grab range of the contents of the view. We'll use this to size the heatmap.
        const range3d = vp.view.computeFitRange();
        const range = Range2d.createFrom(range3d);

        // We'll draw the heatmap as an overlay in the center of the view's Z extents.
        const height = range3d.high.interpolate(0.5, range3d.low).z;

        HeatmapDecoratorApp.disableDecorations();
        HeatmapDecoratorApp.setupDecorator(pointsState, range, spreadFactorState, height);
        if (showDecoratorState) {
          HeatmapDecoratorApp.enableDecorations();
        }

        setRangeState(range);
      }
    }

    return () => {
      HeatmapDecoratorApp.disableDecorations();
      HeatmapDecoratorApp.decorator = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect when the points get updated
  useEffect(() => {
    if (HeatmapDecoratorApp.decorator)
      HeatmapDecoratorApp.decorator.setPoints(pointsState);
  }, [pointsState]);

  useEffect(() => {
    if (HeatmapDecoratorApp.decorator)
      HeatmapDecoratorApp.decorator.setSpreadFactor(spreadFactorState);
  }, [spreadFactorState]);

  useEffect(() => {
    if (showDecoratorState)
      HeatmapDecoratorApp.enableDecorations();
    else
      HeatmapDecoratorApp.disableDecorations();
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

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col">
        <span>Show Heatmap</span>
        <Toggle isOn={showDecoratorState} onChange={_onChangeShowHeatmap} />
        <PointSelector onPointsChanged={_onPointsChanged} range={rangeState} />
        <span>Spread Factor</span>
        <Slider min={0} max={100} values={[spreadFactorState]} step={1} onUpdate={_onChangeSpreadFactor} />
      </div>
    </>
  );
};

export class HeatmapDecoratorWidgetProvider implements UiItemsProvider {
  public readonly id: string = "HeatmapDecoratorWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "HeatmapDecoratorWidget",
          label: "Heatmap Decorator Selector",
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <HeatmapDecoratorWidget />,
        }
      );
    }
    return widgets;
  }

}
