/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { Frustum } from "@itwin/core-common";
// import { Point3d } from "@itwin/core-geometry";
import { ScreenViewport } from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";
import { useEffectSkipFirst } from "@itwin/core-react";
import { Select, SelectOption, ToggleSwitch } from "@itwin/itwinui-react";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { DividerComponent } from "./Divider";
// import { Frustum } from "@itwin/core-common";
import "./SwipingComparison.scss";
import SwipingComparisonApi, { ComparisonType } from "./SwipingComparisonApi";

interface SwipingComparisonWidgetProps { appContainerId: string }

/** Custom hook to hold the previous value of a state. */
function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  // On Every render, save the value.
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const INITIAL_LOCK_STATE = false;

const SwipingComparisonWidget: React.FunctionComponent<SwipingComparisonWidgetProps> = (props: SwipingComparisonWidgetProps) => {
  const viewport = useActiveViewport();

  const [viewRect, setViewRect] = React.useState<DOMRect>();
  const prevRect = usePrevious<DOMRect | undefined>(viewRect);
  const [dividerLeftState, setDividerLeftState] = React.useState<number>();
  const [isLockedState, setIsLockedState] = React.useState<boolean>(INITIAL_LOCK_STATE);

  const [screenPointState, setScreenPointState] = React.useState<Point3d>();
  const appContainer = useRef<Element | null>(null);
  const [frustum, setFrustum] = React.useState<Frustum>();
  const [comparisonState, setComparisonState] = React.useState<ComparisonType>(ComparisonType.RealityData);

  // Clean up on dismount
  useEffectSkipFirst(() => SwipingComparisonApi.teardown(), []);

  // eslint-disable-next-line no-console
  useEffect(() => viewport?.iModel.selectionSet.onChanged.addListener((ev) => console.debug(...ev.set.elements.entries())), [viewport]);

  useEffect(() => {
    if (!appContainer.current || appContainer.current.id !== props.appContainerId)
      appContainer.current = document.getElementById(props.appContainerId);
  }, [props]);

  useEffect(() => {
    if (!viewport) return;
    // Start listener for view being navigated.
    const unsubRender = viewport.onRender.addListener((vp) => {
      const latestFrustum = SwipingComparisonApi.getFrustum(vp);
      if (frustum === undefined || !frustum.isSame(latestFrustum))
        setFrustum(latestFrustum);
    });
    // return callback to unsubscribe to event
    return unsubRender;
  }, [viewport, frustum]);

  // useEffect(() => {
  // }, [frustum]);

  useEffect(() => {
    if (!viewport) return;
    // Start listener for Viewport getting resized.
    const unsubOnResize = viewport.onResized.addListener((vp) => {
      setViewRect(SwipingComparisonApi.getRect(vp as ScreenViewport));
    });
    // return callback to unsubscribe to event
    return () => unsubOnResize();
  }, [viewport]);

  /** Initialize the view and all the viewport dependant states. */
  useEffect(() => {
    if (!viewport) return;
    // Initialize the divider position and bounds.
    const clientRect = SwipingComparisonApi.getRect(viewport);
    setViewRect(clientRect);
    // Initial position of the divider is centered on the viewport
    const dividerPos = clientRect.left + (clientRect.width / 2);
    setFrustum(SwipingComparisonApi.getFrustum(viewport));
    setDividerLeftState(dividerPos);

    viewport.viewFlags = viewport.viewFlags.copy({ clipVolume: false });

    // Attach reality data so it's visible in the viewport
    SwipingComparisonApi.attachRealityData(viewport)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, [viewport]);

  /** Reacting to the viewport resizing. */
  useEffect(() => {
    if (dividerLeftState === undefined
      || prevRect === undefined
      || viewRect === undefined
    )
      return;
    const oldBounds = prevRect, newBounds = viewRect;
    const dividerRatio = (dividerLeftState - oldBounds.left) / oldBounds.width;
    const newLeft = (dividerRatio * newBounds.width) + newBounds.left;
    setDividerLeftState(newLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewRect]);

  // const onViewUpdate = useCallback((vp: Viewport) => {
  //   const newFrustum = SwipingComparisonApi.getFrustum(vp);
  //   setFrustum(newFrustum);
  // }, []);

  useEffect(() => {
    if (viewport) {
      SwipingComparisonApi.setRealityModelTransparent(viewport, comparisonState === ComparisonType.RealityData);
    }
  }, [viewport, comparisonState]);

  const calculateScreenPoint = (bounds: DOMRect, leftInWindowSpace: number): Point3d => {
    const y = bounds.top + (bounds.height / 2);
    // The point needs to be returned relative to the canvas.
    const left = leftInWindowSpace - bounds.left;
    return new Point3d(left, y, 0);
  };

  useEffect(() => {
    if (viewport && dividerLeftState) {
      const bounds = SwipingComparisonApi.getRect(viewport);
      const newScreenPoint = calculateScreenPoint(bounds, dividerLeftState);
      setScreenPointState(newScreenPoint);
    }
  }, [dividerLeftState, viewport]);

  useEffect(() => {
    if (viewport && screenPointState && frustum)
      // SwipingComparisonApi.compare(isLockedState ? undefined : screenPointState, viewport, comparisonState);
      SwipingComparisonApi.compare(screenPointState, viewport, comparisonState);
  }, [comparisonState, frustum, screenPointState, viewport, isLockedState]);

  const _onDividerMoved = (leftWidth: number, rightWidth: number) => {
    // leftWidth is relative to the canvas.  We need to track left based on the window
    const sliderWidth = viewRect!.width - (leftWidth + rightWidth);
    const left = leftWidth + (sliderWidth / 2);
    const updatedLeft = left + viewRect!.left;

    setDividerLeftState(updatedLeft);
  };

  const options: SelectOption<ComparisonType>[] = Object.entries(ComparisonType)
    .filter(([_, value]: any) => typeof value !== "string")
    .map(([key, value]) => ({ value: (value as ComparisonType), label: key }));

  return (
    <>
      {/** Using the createPortal to */}
      {appContainer.current && ReactDOM.createPortal(
        (<>
          {/** The divider to move left and right. */}
          {viewRect && dividerLeftState && !isLockedState &&
            <DividerComponent sideL={dividerLeftState - viewRect.left} bounds={viewRect} onDragged={_onDividerMoved} />
          }
        </>), appContainer.current)
      }
      <div className="sample-options">
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label>Lock Plane</label>
          <ToggleSwitch
            label={"Lock dividing plane"}
            defaultChecked={INITIAL_LOCK_STATE}
            labelPosition={"left"}
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => setIsLockedState(e.target.checked)}
          />
          <label>Comparison Type</label>
          <Select<ComparisonType>
            value={comparisonState}
            onChange={(value) => setComparisonState(value)}
            disabled={undefined === viewport}
            options={options}
          />
        </div>
      </div>
    </>
  );
};

export class SwipingComparisonWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SwipingComparisonWidgetProvider";

  constructor(private readonly appContainerId: string) {
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "SwipingComparisonWidget",
          label: "Swiping Comparison Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SwipingComparisonWidget appContainerId={this.appContainerId} />,
        },
      );
    }
    return widgets;
  }
}
