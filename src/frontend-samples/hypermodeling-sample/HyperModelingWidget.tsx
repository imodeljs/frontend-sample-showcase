/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { assert, Id64String } from "@bentley/bentleyjs-core";
import { IModelApp, ViewState } from "@bentley/imodeljs-frontend";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { Button, Toggle } from "@bentley/ui-core";
import HyperModelingApp from "./HyperModelingApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";

/** The 3d context that was active before switching to a 2d view. */
interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId: Id64String;
}

export const HyperModelingWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  /** Whether to display 2d section graphics and sheet annotations in the 3d view. */
  const [display2dGraphicsState, setDisplay2dGraphicsState] = React.useState<boolean>(true);
  /** The selected section marker. */
  const [activeMarkerState, setActiveMarkerState] = React.useState<SectionMarker>();
  const [previousState, setPreviousState] = React.useState<Previous>();

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        HyperModelingApp.enableHyperModeling(vp).then(() => {
          HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => setActiveMarkerState(activeMarker));
          HyperModelingApp.activateMarkerByName(vp, "Section-Left");
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        HyperModelingApp.toggle2dGraphics(display2dGraphicsState);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display2dGraphicsState]);

  const onToggle2dGraphics = (toggle: boolean) => {
    setDisplay2dGraphicsState(toggle);
  };

  const returnTo3d = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp && previousState) {
      await HyperModelingApp.switchTo3d(vp, previousState.view, previousState.markerId);
      setPreviousState(undefined);
    }
  };

  const switchToDrawingView = async () => {
    return switchTo2d("drawing");
  };

  const switchToSheetView = async () => {
    return switchTo2d("sheet");
  };

  const switchTo2d = async (which: "sheet" | "drawing") => {
    const vp = IModelApp.viewManager.selectedView;
    assert(undefined !== vp && undefined !== activeMarkerState);

    const view = vp.view;
    if (await HyperModelingApp.switchTo2d(vp, activeMarkerState, which))
      setPreviousState({ view, markerId: activeMarkerState.state.id });
  };

  const clearActiveMarker = () => {
    const vp = IModelApp.viewManager.selectedView;
    assert(undefined !== vp);
    HyperModelingApp.clearActiveMarker(vp);
  };

  return (
    <>
      {(previousState) && (
        <div className="sample-options-3col-even">
          <span />
          <Button onClick={returnTo3d}>Return to 3d view</Button>
        </div>
      )}
      {(!previousState) && (
        <div className="sample-options-3col-even">
          <span>Display 2d graphics</span>
          <Toggle isOn={display2dGraphicsState} onChange={onToggle2dGraphics} disabled={!activeMarkerState} />
          <span />
          <Button onClick={switchToDrawingView} disabled={!activeMarkerState}>View section drawing</Button>
          <Button onClick={switchToSheetView} disabled={!activeMarkerState?.state.viewAttachment}>View on sheet</Button>
          <Button onClick={clearActiveMarker} disabled={!activeMarkerState}>Select new marker</Button>
        </div>
      )}
    </>
  );
};
