/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Id64String } from "@bentley/bentleyjs-core";
import { ViewState } from "@bentley/imodeljs-frontend";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { Button, Toggle } from "@bentley/ui-core";

/** The 3d context that was active before switching to a 2d view. */
interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId: Id64String;
}

export interface HyperModelingProps {
  toggle2dGraphics: boolean;
  activeMarker?: SectionMarker;
  previous: boolean;
  onToggle2dGraphicsFunc: (toggle: boolean) => void;
  onClickReturnTo3D: () => void;
  onClickSelectNewMarker: () => void;
  onClickSwitchTo2d: (which: "sheet" | "drawing") => void;
}

export const HyperModelingWidget: React.FunctionComponent<HyperModelingProps> = ({ toggle2dGraphics, activeMarker, previous, onToggle2dGraphicsFunc, onClickReturnTo3D, onClickSelectNewMarker, onClickSwitchTo2d }) => {
  /** Whether to display 2d section graphics and sheet annotations in the 3d view. */
  const [toggle2dGraphicsState, setToggle2dGraphics] = React.useState<boolean>(toggle2dGraphics);
  /** The selected section marker. */
  const [activeMarkerState, setActiveMarkerState] = React.useState<SectionMarker>();
  const [previousState, setPreviousState] = React.useState<boolean>(previous);

  useEffect(() => {
    if (undefined !== activeMarker) {
      setActiveMarkerState(activeMarker);
    }
  }, [activeMarker]);

  useEffect(() => {
    setPreviousState(previous);
  }, [previous]);

  const onToggle2dGraphics = (toggle: boolean) => {
    onToggle2dGraphicsFunc(toggle);
    setToggle2dGraphics(toggle);
  };

  const switchToDrawingView = async () => {
    return onClickSwitchTo2d("drawing");
  };

  const switchToSheetView = async () => {
    return onClickSwitchTo2d("sheet");
  };

  return (
    <>
      {(previousState) && (
        <div className="sample-options-3col-even">
          <span />
          <Button onClick={onClickReturnTo3D}>Return to 3d view</Button>
        </div>
      )}
      {(!previousState) && (
        <div className="sample-options-3col-even">
          <span>Display 2d graphics</span>
          <Toggle isOn={toggle2dGraphicsState} onChange={onToggle2dGraphics} disabled={!activeMarkerState} />
          <span />
          <Button onClick={switchToDrawingView} disabled={!activeMarkerState}>View section drawing</Button>
          <Button onClick={switchToSheetView} disabled={!activeMarkerState?.state.viewAttachment}>View on sheet</Button>
          <Button onClick={onClickSelectNewMarker} disabled={!activeMarkerState}>Select new marker</Button>
        </div>
      )}
    </>
  );
};
