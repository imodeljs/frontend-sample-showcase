/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { Button, ButtonType, Select, Toggle } from "@bentley/ui-core";
import { EditManipulator } from "@bentley/imodeljs-frontend";

export interface ViewClipWidgetProps {
  showClipBlock: boolean;
  clipPlane: string;
  handleFlipButton: () => void;
  handleClipPlaneUpdate: (showClipBlock: boolean, clipPlane: string) => void;
}

export const ViewClipWidget: React.FunctionComponent<ViewClipWidgetProps> = ({ showClipBlock, clipPlane, handleFlipButton, handleClipPlaneUpdate }) => {
  const [showClipBlockState, setShowClipBlockState] = React.useState<boolean>(showClipBlock);
  const [clipPlaneState, setClipPlaneState] = React.useState<string>(clipPlane);

  useEffect(() => {
    handleClipPlaneUpdate(showClipBlockState, clipPlaneState);
  }, [showClipBlockState, clipPlaneState, handleClipPlaneUpdate]);

  /* Handler for plane select */
  const _onPlaneSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setShowClipBlockState(false);
    setClipPlaneState(event.target.value);
  };

  /* Turn on/off the clip range */
  const _onToggleRangeClip = async (showClipRange: boolean) => {
    setShowClipBlockState(showClipRange);
    setClipPlaneState("None");
  };

  const options = {
    None: "None",
    [EditManipulator.RotationType.Left]: "X",
    [EditManipulator.RotationType.Front]: "Y",
    [EditManipulator.RotationType.Top]: "Z",
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-3col even-3col">
        <span>Clip Range</span>
        <Toggle isOn={showClipBlockState} onChange={_onToggleRangeClip} />
        <span />
        <span>Clip Plane</span>
        <Select onChange={_onPlaneSelectChange} value={clipPlaneState} options={options} />
        <Button buttonType={ButtonType.Primary} onClick={() => handleFlipButton()} disabled={clipPlaneState === "None"}>Flip</Button>
      </div>
    </>
  );
};
