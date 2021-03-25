/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { UiSettings, UiSettingsResult, UiSettingsStatus } from "@bentley/ui-core";
import { FrontstageManager, UiFramework } from "@bentley/ui-framework";
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useRef } from "react";
import "./SampleWidgetContainer.scss";


const containerStyle = {
  display: "inline-block",
  position: "absolute",
  visibility: "hidden",
  zIndex: -1,
};

export const measureDomNode = (node: HTMLElement) => {
  const container = document.createElement("div");
  (container as any).style = containerStyle;

  const content = node.cloneNode(true) as HTMLElement;

  container.appendChild(content);

  document.body.appendChild(container);

  const height = content.clientHeight;
  const width = content.clientWidth;

  container.parentNode!.removeChild(container);
  return { height, width };
};

export interface SampleWidgetContainerProps {
  frontstageId: string;
  widgetId: string;
  instructions?: string;
  iModelSelector?: ReactNode;
}

export const SampleWidgetContainer: FunctionComponent<SampleWidgetContainerProps> = ({ widgetId, instructions, iModelSelector, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const moveWidget = useCallback((vp: Viewport) => {
    if (ref.current) {
      const vpDims = vp.viewRect;
      const { height, width } = measureDomNode(ref.current);
      const adjustedHeight = height + 30;
      FrontstageManager.activeFrontstageDef!.floatWidget(widgetId, { x: vpDims.width - width - 8, y: vpDims.height - 8 }, { height: adjustedHeight, width });
    }
  }, [ref, widgetId]);

  useEffect(() => {
    const sv = IModelApp.viewManager.selectedView!
    moveWidget(sv);
  }, [moveWidget])

  return (
    <div ref={ref} className="sample-widget-ui">
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
