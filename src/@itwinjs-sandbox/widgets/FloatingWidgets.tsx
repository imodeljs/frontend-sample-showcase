/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { FrontstageDef, UiFramework, WidgetState } from "@bentley/ui-framework";
import React, { createElement, useRef } from "react";

export class FloatingWidgetsManager {

  public static onFrontstageReady = async (frontstage: FrontstageDef) => {
    const uiSettings = UiFramework.getUiSettings();
    const widgets = frontstage.rightPanel?.widgetDefs.filter((widget) => widget.defaultState === WidgetState.Floating).reverse() || [];

    const heightSet: { [id: number]: Promise<DOMRect> } = {};
    const doms: { [id: number]: HTMLElement } = {};

    widgets.forEach((widget, index) => {
      heightSet[index] = new Promise((resolve) => {
        const ogNode = widget.reactNode;
        widget.reactNode = createElement(({ children }) => {
          const ref = useRef<HTMLDivElement>(null);

          widget.onWidgetStateChanged = () => {
            if (ref.current) {
              const widgetDom = ref.current.closest(".nz-widget-floatingWidget");
              if (widgetDom && !widgetDom.classList.contains("custom")) {
                doms[index] = widgetDom as HTMLElement;
                widgetDom.className = `${widgetDom.className} custom`;
                (widgetDom as HTMLElement).style.width = "unset";
                resolve(widgetDom.getBoundingClientRect());
              }
            }
          };

          return <div ref={ref}>{children}</div>;
        }, undefined, ogNode);
      });
    });

    Promise.all(Object.values(heightSet))
      .then((rects) => {
        const width = Math.max(...rects.map((set) => set.width));
        for (const index in doms) {
          if (doms[index]) {
            let height = 16;
            rects.forEach((rect, key) => {
              if (key < Number.parseInt(index, 10)) {
                height += rect.height + 16;
              }
            });

            doms[index].style.bottom = `${height}px`;
            doms[index].style.width = `${width}px`;
          }
        }
      });

    await uiSettings.deleteSetting("uifw-frontstageSettings", `frontstageState[${frontstage.id}]`);
    frontstage.restoreLayout();

    widgets.map((widget) => frontstage.floatWidget(widget.id, undefined, undefined));
    widgets.forEach((widget) => widget.setWidgetState(WidgetState.Floating));
  };
}
