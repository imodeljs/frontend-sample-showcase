/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Select, Toggle } from "@itwin/core-react";
import SwipingComparisonApi, { ComparisonType } from "./SwipingComparisonApi";
import { Point3d } from "@itwin/core-geometry";
import { IModelApp, ScreenViewport, Viewport } from "@itwin/core-frontend";
import { Frustum } from "@itwin/core-common";
import "./SwipingComparison.scss";

const SwipingComparisonWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const viewport = IModelApp.viewManager.selectedView;
  const [screenPointState, setScreenPointState] = React.useState<Point3d>();
  const [dividerLeftState, setDividerLeftState] = React.useState<number>();
  const [frustum, setFrustum] = React.useState<Frustum>();
  const [isLockedState, setIsLockedState] = React.useState<boolean>(false);
  const [isRealityDataState] = React.useState<boolean>(true);
  const [comparisonState, setComparisonState] = React.useState<ComparisonType>(ComparisonType.RealityData);
  const [isInit, setIsInit] = React.useState<boolean>(false);

  const initPositionDivider = (bounds: ClientRect): number => {
    return bounds.left + (bounds.width / 2);
  };

  const onViewUpdate = useCallback((vp: Viewport) => {
    const newFrustum = SwipingComparisonApi.getFrustum(vp);
    setFrustum(newFrustum);
  }, []);

  // Should be called when the Viewport is ready.
  const _initViewport = useCallback((vp: ScreenViewport) => {
    SwipingComparisonApi.attachRealityData(vp, iModelConnection!)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    SwipingComparisonApi.setRealityModelTransparent(vp, ComparisonType.RealityData !== comparisonState);
    SwipingComparisonApi.listerForViewportUpdate(vp, onViewUpdate);
    const dividerPos = initPositionDivider(SwipingComparisonApi.getClientRect(vp));
    setDividerLeftState(dividerPos);
    setIsInit(true);
    return () => {
      SwipingComparisonApi.teardown();
    };
  }, [comparisonState, iModelConnection, onViewUpdate]);

  useEffect(() => {
    const unSubscribe = SwipingComparisonApi.onSwipeEvent.addListener((num) => setDividerLeftState(num));
    return () => unSubscribe();
  }, []);

  useEffect(() => {
    if (viewport && !isInit) {
      /** Initially the widget is docked to the right of the screen, which is then updated to be floating in the sample showcase.
       * If we don't wait for the widget to be in a floating state, the dimensions of the viewport will be off, and thus the dividerState.
       */
      setTimeout(() => { _initViewport(viewport); }, 200);
    } else if (!isInit)
      IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => _initViewport(_vp));
  }, [_initViewport, isInit, viewport]);

  useEffect(() => {
    if (viewport && isRealityDataState) {
      SwipingComparisonApi.setRealityModelTransparent(viewport, isRealityDataState);
    }
  }, [viewport, isRealityDataState]);

  /** Send the locked event */
  useEffect(() => {
    SwipingComparisonApi.onLockEvent.raiseEvent(isLockedState);
  }, [isLockedState]);

  useEffect(() => {
    if (viewport && dividerLeftState) {
      const bounds = SwipingComparisonApi.getClientRect(viewport);
      const newScreenPoint = calculateScreenPoint(bounds, dividerLeftState);
      setScreenPointState(newScreenPoint);
    }
  }, [dividerLeftState, viewport]);

  useEffect(() => {
    if (viewport && screenPointState && frustum)
      SwipingComparisonApi.compare(screenPointState, viewport, comparisonState);
  }, [comparisonState, frustum, screenPointState, viewport]);

  const calculateScreenPoint = (bounds: ClientRect, leftInWindowSpace: number): Point3d => {
    const y = bounds.top + (bounds.height / 2);
    // The point needs to be returned relative to the canvas.
    const left = leftInWindowSpace - bounds.left;
    return new Point3d(left, y, 0);
  };

  const keys = Object.keys(ComparisonType).filter((key: any) => isNaN(key));
  const options = Object.assign({}, keys);

  return (
    <>
      <div className="sample-options">
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label>Lock Plane</label>
          <Toggle title={"Lock dividing plane"} isOn={isLockedState} onChange={(isOn: boolean) => setIsLockedState(isOn)}></Toggle>

          <label>Comparison Type</label>
          <Select value={comparisonState} onChange={(event) => setComparisonState(Number.parseInt(event.target.value, 10))} disabled={undefined === viewport && undefined === iModelConnection} options={options} />
        </div>
      </div>
    </>
  );
};

export class SwipingComparisonWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SwipingComparisonWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "SwipingComparisonWidget",
          label: "Swiping Comparison Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SwipingComparisonWidget />,
        }
      );
    }
    return widgets;
  }
}
