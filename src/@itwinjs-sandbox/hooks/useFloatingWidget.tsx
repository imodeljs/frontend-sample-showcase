/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StagePanelLocation, StagePanelSection, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract";
import { useResizeObserver } from "@bentley/ui-core";
import { FrontstageDef, FrontstageManager, WidgetState } from "@bentley/ui-framework";
import React, { createElement, useCallback, useEffect, useRef, useState } from "react";

export const useFloatingWidget = (viewportId: string) => {
  const ref = useRef<HTMLElement | null>(null);
  const [widgetDOMs, setWidgetDOMs] = useState<{ [id: string]: HTMLElement | null }>({});
  const expectedWidgets = useRef(-1);
  const updatedProviders = useRef<UiItemsProvider[]>([]);

  useEffect(() => {
    ref.current = document.getElementById(viewportId);
  }, [viewportId]);

  useEffect(() => {
    UiItemsManager.onUiProviderRegisteredEvent.addListener(({ providerId }) => {
      if (!updatedProviders.current.some((provider) => provider.id === providerId)) {
        const provider = UiItemsManager.getUiItemsProvider(providerId);
        if (provider) {
          const provideWidgets = provider.provideWidgets?.bind(provider);
          if (provideWidgets) {
            provider.provideWidgets = (stageId: string, stageUsage: string, location: StagePanelLocation, section?: StagePanelSection | undefined) => {
              if (location === StagePanelLocation.Right) {
                const result = provideWidgets(stageId, stageUsage, location, section);
                let updatedWidgets = result.filter((widget) => (widget.defaultState === WidgetState.Floating));
                updatedWidgets = updatedWidgets.map((widget) => {
                  return {
                    ...widget,
                    // eslint-disable-next-line react/display-name
                    getWidgetContent: () => {

                      return <div style={{ height: "max-content" }} ref={(devRef) => {
                        setWidgetDOMs((doms) => ({ [widget.id!]: devRef, ...doms }));
                      }}>{createElement(widget.getWidgetContent)}</div>;
                    },
                  };
                });
                const filteredResult = result.filter((widget) => (widget.defaultState !== WidgetState.Floating));
                return [...filteredResult, ...updatedWidgets];
              } else {
                return provideWidgets(stageId, stageUsage, location, section);
              }
            };
            updatedProviders.current = [provider, ...updatedProviders.current];
          }
        }
      }
    });
    return () => {
      updatedProviders.current = [];
    };
  }, []);

  const [dimensions, setDimensions] = useState<{ height: number, width: number }>({ height: 0, width: 0 });

  const onResize = useCallback((width: number, height: number) => {
    setDimensions({ height, width });
  }, [setDimensions]);

  const resizeObserver = useResizeObserver(onResize);

  const [frontstage, setFrontstage] = useState<FrontstageDef>();

  useEffect(() => {
    const unsub = FrontstageManager.onFrontstageActivatedEvent.addListener(({ activatedFrontstageDef }) => {
      setFrontstage(activatedFrontstageDef);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (frontstage) {
      updatedProviders.current.forEach((provider) => {
        UiItemsManager.unregister(provider.id);
        UiItemsManager.register(provider);
      });
      const widgets = UiItemsManager.getWidgets(frontstage.id, frontstage.usage, StagePanelLocation.Right).filter((widget) => widget.defaultState === WidgetState.Floating && widget.providerId) || [];
      expectedWidgets.current = widgets.length;
    }
  }, [frontstage]);

  useEffect(() => {
    if (frontstage && Object.keys(widgetDOMs).length === expectedWidgets.current) {
      frontstage.restoreLayout();
      let heightOffset = 16;
      for (const id in widgetDOMs) {
        if (Object.prototype.hasOwnProperty.call(widgetDOMs, id) && widgetDOMs[id] !== null) {
          const rect = widgetDOMs[id]!.getBoundingClientRect();
          let height = rect.height + 29 + 40;
          height = height > 500 ? 500 : height;
          heightOffset += height + 16;
          frontstage.floatWidget(id, { x: dimensions.width - 300 - 32, y: dimensions.height - heightOffset }, { height, width: 300 });
        } else if (widgetDOMs[id] === null) {
          setWidgetDOMs((doms) => {
            delete doms[id];
            return doms;
          });
        }
      }
    }
  }, [frontstage, dimensions, widgetDOMs, expectedWidgets]);

  useEffect(() => {
    resizeObserver(ref.current);
  }, [resizeObserver, ref]);

};
