/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, ReactNode } from "react";
import "./SampleWidgetContainer.scss";
export interface SampleWidgetContainerProps {
  instructions?: string;
  iModelSelector?: ReactNode;
}

export const SampleWidgetContainer: FunctionComponent<SampleWidgetContainerProps> = ({ instructions, iModelSelector, children }) => {

  return (
    <div className="sample-widget-ui">
      {instructions && <div className="control-pane-header">
        <div className="sample-instructions">
          <span>{instructions}</span>
        </div>
      </div>}
      {iModelSelector}
      {children && <hr></hr>}
      {children && children}
    </div>
  );
};
