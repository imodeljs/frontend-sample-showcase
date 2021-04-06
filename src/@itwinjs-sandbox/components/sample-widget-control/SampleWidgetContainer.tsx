/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { PointProps, SizeProps } from "@bentley/ui-core";
import { FrontstageManager, useUiSettingsContext } from "@bentley/ui-framework";
import React, { CSSProperties, FunctionComponent, ReactNode, useCallback, useEffect, useRef } from "react";
import "./SampleWidgetContainer.scss";

const containerStyle: CSSProperties = {
  display: "block",
  position: "absolute",
  visibility: "hidden",
  height: "100vh",
  width: "100vw",
  zIndex: -1,
};

export const measureDomNode = (node: HTMLElement) => {
  const container = document.createElement("div");
  (container as any).style = containerStyle;

  const content = node.cloneNode(true) as HTMLElement;

  container.appendChild(content);

  document.body.appendChild(container);
  const { height, width } = content.getBoundingClientRect();

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
  const uiSettings = useUiSettingsContext();

  const floatWidget = useCallback(async (points?: PointProps, size?: SizeProps) => {
    await uiSettings.deleteSetting("uifw-frontstageSettings", `frontstageState[${FrontstageManager.activeFrontstageDef!.id}]`);
    FrontstageManager.activeFrontstageDef!.restoreLayout();
    FrontstageManager.activeFrontstageDef!.floatWidget(widgetId, points, size);
  }, [uiSettings, widgetId]);

  const moveWidget = useCallback(async (vp: Viewport) => {
    if (ref.current) {
      await floatWidget(undefined, { height: 0, width: 0 });
      const vpDims = vp.viewRect;
      const { height, width } = measureDomNode(ref.current);
      const adjustedHeight = height + 30;
      await floatWidget({ x: (vpDims.right - width) - 32, y: vpDims.bottom - adjustedHeight - 32 }, { height: adjustedHeight, width });
    }
  }, [ref, floatWidget]);

  useEffect(() => {
    const sv = IModelApp.viewManager.selectedView!;
    const unsub = sv.onResized.addListener((vp) => {
      setTimeout(async () => moveWidget(vp), 0);
    });
    FrontstageManager.onFrontstageReadyEvent.addOnce(() => {
      moveWidget(sv);
    });
    return unsub;
  }, [moveWidget, uiSettings]);

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
