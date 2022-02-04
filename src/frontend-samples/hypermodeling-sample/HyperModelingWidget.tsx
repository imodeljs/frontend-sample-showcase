/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { ChangeEvent, useCallback, useEffect } from "react";
import { SectionMarker } from "@itwin/hypermodeling-frontend";
import { ViewState } from "@itwin/core-frontend";
import HyperModelingApi from "./HyperModelingApi";
import { assert, Id64String } from "@itwin/core-bentley";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { Button, ToggleSwitch } from "@itwin/itwinui-react";
import "./HyperModeling.scss";

interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId?: Id64String;
}

export const HyperModelingWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [toggle2dGraphics, setToggle2dGraphics] = React.useState<boolean>(true);
  const [activeMarker, setActiveMarker] = React.useState<SectionMarker>();
  const [previous, setPrevious] = React.useState<Previous>();

  useEffect(() => {
    if (viewport) {
      const removeListeners: (() => void)[] = [];
      HyperModelingApi.enableHyperModeling(viewport)
        .then(() => {
          removeListeners.push(HyperModelingApi.markerHandler.onActiveMarkerChanged.addListener((marker) => {
            setActiveMarker(marker);
          }));
          removeListeners.push(HyperModelingApi.markerHandler.onToolbarCommand.addListener((prevMarker) => {
            const view = viewport.view;
            setPrevious({ view, markerId: prevMarker?.state.id });
          }));
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
      return () => {
        removeListeners.forEach((remove) => remove());
        HyperModelingApi.disableHyperModeling(viewport)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      };
    }
    return;
  }, [viewport]);

  const onClickReturnTo3D = useCallback(async () => {
    if (viewport && previous) {
      await HyperModelingApi.switchTo3d(viewport, previous.view, previous.markerId);
      setPrevious(undefined);
    }
  }, [previous, viewport]);

  const onClickSelectNewMarker = () => {
    if (viewport) {
      HyperModelingApi.clearActiveMarker(viewport);
    }
  };

  const onClickSwitchTo2d = useCallback(async (which: "sheet" | "drawing", marker: SectionMarker | undefined) => {
    assert(undefined !== viewport && undefined !== marker);

    const view = viewport.view;
    if (await HyperModelingApi.switchTo2d(viewport, marker, which))
      setPrevious({ view, markerId: marker.state.id });
  }, [viewport]);

  const onToggle2dGraphics = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (viewport) {
      const checked = event.target.checked;
      HyperModelingApi.toggle2dGraphics(checked);
      setToggle2dGraphics(checked);
    }
  }, [viewport]);

  const switchToDrawingView = useCallback(async () => {
    return onClickSwitchTo2d("drawing", activeMarker);
  }, [onClickSwitchTo2d, activeMarker]);

  const switchToSheetView = useCallback(async () => {
    return onClickSwitchTo2d("sheet", activeMarker);
  }, [onClickSwitchTo2d, activeMarker]);

  return (
    <div className="sample-options">
      {(previous) && (
        <div className="sample-options-2col">
          <span>3D View:</span>
          <Button size="small" styleType="cta" onClick={onClickReturnTo3D}>View</Button>
        </div>
      )}
      {(!previous) && (
        <div className="sample-options-2col">
          <span>Display 2D graphics:</span>
          <ToggleSwitch checked={toggle2dGraphics} onChange={onToggle2dGraphics} disabled={!activeMarker} />
          <span>Section Drawing:</span>
          <Button size="small" styleType="high-visibility" onClick={switchToDrawingView} disabled={!activeMarker}>View</Button>
          <span>Sheet View:</span>
          <Button size="small" styleType="high-visibility" onClick={switchToSheetView} disabled={!activeMarker?.state.viewAttachment}>View</Button>
          <span>New Marker:</span>
          <Button size="small" styleType="cta" onClick={onClickSelectNewMarker} disabled={!activeMarker}>Select</Button>
        </div>
      )}
    </div>
  );
};

export class HyperModelingWidgetProvider implements UiItemsProvider {
  public readonly id: string = "HypermodelingWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "HypermodelingWidget",
          label: "Hyper-Modeling Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <HyperModelingWidget />,
        },
      );
    }
    return widgets;
  }
}
