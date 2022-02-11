/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IDisposable } from "@itwin/core-bentley";
import { StagePanelLocation, StageUsage, UiItemProviderRegisteredEventArgs, UiItemsManager, WidgetState } from "@itwin/appui-abstract";
import { FrontstageManager } from "@itwin/appui-react";

export class FloatingWidgets implements IDisposable {
  private _container: HTMLElement;
  private _uiItemsProviderRegisteredListener: () => void;
  private _frontstageActivatedListener: () => void;
  private _resizeObserver: ResizeObserver;
  private _widgetIds: string[];

  constructor(domId: string) {
    const container = document.getElementById(domId);
    if (!container) {
      throw new Error(`Failed to get element by ID: ${domId}`);
    }
    this._container = container;
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this._container);
    this._uiItemsProviderRegisteredListener = UiItemsManager.onUiProviderRegisteredEvent.addListener(this._onUiItemProviderRegister);
    this._frontstageActivatedListener = FrontstageManager.onFrontstageActivatedEvent.addListener(this._onFrontstageReady);
    this._widgetIds = [];
  }

  private _onUiItemProviderRegister = ({ providerId }: UiItemProviderRegisteredEventArgs) => {
    const provider = UiItemsManager.getUiItemsProvider(providerId);
    if (provider && provider.provideWidgets) {
      const widgets = provider.provideWidgets("DefaultFrontstage", StageUsage.General, StagePanelLocation.Right);
      widgets.filter((w) => !!w.id).forEach((w) => {
        if (!this._widgetIds.includes(w.id!) && w.defaultState === WidgetState.Floating) {
          this._widgetIds.unshift(w.id!);
        }
      });

    }
  };

  public resetWidgets() {
    const frontstage = FrontstageManager.activeFrontstageDef;
    if (frontstage) {
      frontstage.restoreLayout();
      this._widgetIds.map((id) => {
        frontstage.floatWidget(id, { x: 0, y: 0 }, { height: 0, width: 0 });
      });
    }
  }

  private _onFrontstageReady = () => {
    this.resetWidgets();
    this._handleResize(this._container.getBoundingClientRect());
  };

  private _onResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    window.requestAnimationFrame(() => {
      const entry = entries[0];
      if (entry) {
        const dimensions = entry.target.getBoundingClientRect();
        this._handleResize(dimensions);
      }
    });
  };

  private _handleResize = debounce(async (dimensions: DOMRectReadOnly) => {
    const frontstage = FrontstageManager.activeFrontstageDef;
    if (frontstage) {
      frontstage.restoreLayout();
      this._widgetIds.map((id) => {
        frontstage.floatWidget(id, { x: 0, y: 0 }, { height: 0, width: 0 });
      });
      let heightOffset = 16;
      const maxWidth = Math.max(...this._widgetIds.map((id) => {
        const containerId = frontstage.getFloatingWidgetContainerIdByWidgetId(id);
        const rect = frontstage.getFloatingWidgetContainerBounds(containerId);
        if (rect) {
          const width = rect.right - rect.left;
          return width;
        }
        return 0;
      }));

      const widgets = this._widgetIds.map((id) => {
        const containerId = frontstage.getFloatingWidgetContainerIdByWidgetId(id);
        const rect = frontstage.getFloatingWidgetContainerBounds(containerId);
        if (rect) {
          const height = rect.bottom - rect.top + 25;
          heightOffset += height + 16;
          const width = maxWidth;
          return { id, point: { x: dimensions.width - width - 32, y: dimensions.height - heightOffset }, size: { height, width } };
        }
        return undefined;
      });

      frontstage.restoreLayout();
      widgets.forEach((widget) => {
        if (widget) {
          frontstage.floatWidget(widget.id, widget.point, widget.size);

          const containerId = frontstage.getFloatingWidgetContainerIdByWidgetId(widget.id);
          if (containerId) {
            frontstage.setFloatingWidgetContainerBounds(containerId, {
              left: widget.point.x,
              right: widget.point.x + widget.size.width,
              top: widget.point.y,
              bottom: widget.point.y + widget.size.height,
            });
          }
        }
      });
    }
  }, 300);

  public dispose = (): void => {
    this._uiItemsProviderRegisteredListener();
    this._frontstageActivatedListener();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  };
}

export function debounce<Params extends unknown[]>(func: (...args: Params) => unknown, timeout: number): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
