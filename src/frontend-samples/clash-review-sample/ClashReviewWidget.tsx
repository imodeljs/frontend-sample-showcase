import React from "react";
import { Button, ButtonSize, ButtonType, Toggle } from "@bentley/ui-core";
import ClashReviewApp from "./ClashReviewApp";

export interface ClashReviewWidgetProps {
  applyZoom: boolean;
  showDecorator: boolean;
  setShowDecorator: (value: boolean) => void;
  setApplyZoom: (value: boolean) => void;
}

export const ClashReviewWidget: React.FunctionComponent<ClashReviewWidgetProps> = ({ applyZoom, showDecorator, setShowDecorator, setApplyZoom }) => {

  /** Called when the user changes the showMarkers toggle. */
  const _onChangeShowMarkers = (checked: boolean) => {
    if (checked) {
      setShowDecorator(true);
    } else {
      setShowDecorator(false);
    }
  };

  /** Called when the user changes the applyZoom toggle. */
  const _onChangeApplyZoom = (checked: boolean) => {
    if (checked) {
      setApplyZoom(true);
    } else {
      setApplyZoom(false);
    }
  };

  return (
    <>
      <div className="sample-options-2col">
        <span>Show Markers</span>
        <Toggle isOn={showDecorator} onChange={_onChangeShowMarkers} />
      </div>
      <div className="sample-options-2col">
        <span>Apply Zoom</span>
        <Toggle isOn={applyZoom} onChange={_onChangeApplyZoom} />
      </div>
      <div className="sample-options-2col">
        <span>Display</span>
        <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} onClick={ClashReviewApp.resetDisplay}>Reset</Button>
      </div>
    </>
  );
};

