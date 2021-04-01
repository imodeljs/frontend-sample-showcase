/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { Toggle } from "@bentley/ui-core";

export interface MultiViewportWidgetProps {
  disabled?: boolean;
  isSynced: boolean;
  onToggleSyncChange: (isSynced: boolean) => void;
}

export const MultiViewportWidget: React.FunctionComponent<MultiViewportWidgetProps> = ({ disabled = true, isSynced, onToggleSyncChange }) => {

  return (
    <>
      <div className="sample-options-2col">
        <span>Sync Viewports</span>
        <Toggle disabled={disabled} isOn={isSynced} onChange={onToggleSyncChange} />
      </div>
    </>
  );
};
