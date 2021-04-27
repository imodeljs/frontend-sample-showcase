/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AbstractWidgetProps, StagePanelLocation, UiItemsManager } from "@bentley/ui-abstract";
import { FrontstageDef, UiFramework, WidgetState } from "@bentley/ui-framework";
import React, { createElement, useRef } from "react";

export class FloatingWidgetsManager {

  private static _updateFns: { [id: string]: () => { rect: DOMRect, dom: HTMLElement } | undefined } = {};

  public static onFrontstageReady = async (frontstage: FrontstageDef) => {
    const widgets = UiItemsManager.getWidgets(frontstage.id, frontstage?.usage, StagePanelLocation.Right).filter((widget) => widget.defaultState === WidgetState.Floating && widget.providerId) || [];

    widgets.forEach((widget) => {
      const provider = UiItemsManager.getUiItemsProvider(widget.providerId!)!;
      provider.provideWidgets = (_stageId: string, _stageUsage: string, location: StagePanelLocation) => {
        const updatedWidgets: AbstractWidgetProps[] = [];
        if (location === StagePanelLocation.Right) {
          const ogNode = widget.getWidgetContent();
          updatedWidgets.push({
            id: widget.id,
            label: widget.label,
            defaultState: WidgetState.Floating,
            // eslint-disable-next-line react/display-name
            getWidgetContent: () => {
              return createElement(({ children }) => {
                const ref = useRef<HTMLDivElement>(null);

                FloatingWidgetsManager._updateFns[widget.id!] = () => {
                  if (ref.current) {
                    const widgetDom = ref.current.closest(".nz-widget-floatingWidget");
                    if (widgetDom && !widgetDom.classList.contains("custom")) {
                      widgetDom.className = `${widgetDom.className} custom`;
                      (widgetDom as HTMLElement).style.width = "unset";
                      return { rect: widgetDom.getBoundingClientRect(), dom: widgetDom as HTMLElement };
                    }
                  }
                  return undefined;
                };

                return <div ref={ref}>{children}</div>;
              }, undefined, ogNode);
            },
          });
        }
        return updatedWidgets;
      };
      UiItemsManager.unregister(widget.providerId!);
      UiItemsManager.register(provider);
    });

    const uiSettings = UiFramework.getUiSettings();
    await uiSettings.deleteSetting("uifw-frontstageSettings", `frontstageState[${frontstage.id}]`);
    frontstage.restoreLayout();

    const heightSet: { rect: DOMRect, dom: HTMLElement }[] = [];
    widgets.reverse().forEach((widget, index) => {
      frontstage.floatWidget(widget.id!, undefined, undefined);
      heightSet[index] = FloatingWidgetsManager._updateFns[widget.id!]()!;
    });

    const width = Math.max(...heightSet.map((set) => set.rect.width));
    heightSet.forEach((set, index) => {
      let height = 16;
      heightSet.forEach((rect, key) => {
        if (key < index) {
          height += rect.rect.height + 16;
        }
      });

      set.dom.style.bottom = `${height}px`;
      set.dom.style.width = `${width}px`;
    });

  };
}
