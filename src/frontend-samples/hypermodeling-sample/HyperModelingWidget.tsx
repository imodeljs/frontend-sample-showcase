/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useState } from "react";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { Button, Toggle } from "@bentley/ui-core";
import { IModelApp, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import HyperModelingApi from "./HyperModelingApi";
import { assert, Id64String } from "@bentley/bentleyjs-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import "./HyperModeling.scss";

interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId?: Id64String;
}

export const HyperModelingWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [viewport, setViewport] = useState<ScreenViewport>();
  const [toggle2dGraphics, setToggle2dGraphics] = React.useState<boolean>(true);
  const [activeMarker, setActiveMarker] = React.useState<SectionMarker>();
  const [previous, setPrevious] = React.useState<Previous>();

  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      setViewport(vp);
    }
  }, [iModelConnection]);

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

  const onToggle2dGraphics = useCallback((toggle: boolean) => {
    if (viewport) {
      HyperModelingApi.toggle2dGraphics(toggle);
      setToggle2dGraphics(toggle);
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
        <div className="sample-options-3col-even">
          <span />
          <Button onClick={onClickReturnTo3D}>Return to 3d view</Button>
        </div>
      )}
      {(!previous) && (
        <div className="sample-options-3col-even">
          <span>Display 2d graphics</span>
          <Toggle isOn={toggle2dGraphics} onChange={onToggle2dGraphics} disabled={!activeMarker} />
          <span />
          <Button onClick={switchToDrawingView} disabled={!activeMarker}>View section drawing</Button>
          <Button onClick={switchToSheetView} disabled={!activeMarker?.state.viewAttachment}>View on sheet</Button>
          <Button onClick={onClickSelectNewMarker} disabled={!activeMarker}>Select new marker</Button>
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
        }
      );
    }
    return widgets;
  }
}
