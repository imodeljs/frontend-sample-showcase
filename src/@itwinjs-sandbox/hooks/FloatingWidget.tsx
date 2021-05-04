import { IDisposable } from "@bentley/bentleyjs-core";
import { StagePanelLocation, StagePanelSection, UiItemProviderRegisteredEventArgs, UiItemsManager, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { FrontstageManager } from "@bentley/ui-framework";
import React, { createElement } from "react";

export class FloatingWidgets implements IDisposable {
  private _container: HTMLElement;
  private _widgetDoms: WidgetDOMManager;
  private _providerManager: ProviderManager;
  private _uiItemsProviderRegisteredListener: () => void;
  private _frontstageReadyListener: () => void;
  private _resizeObserver: ResizeObserver;

  constructor(domId: string) {
    const container = document.getElementById(domId);
    if (!container) {
      throw new Error(`Failed to get element by ID: ${domId}`);
    }
    this._container = container;
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this._container);
    this._widgetDoms = new WidgetDOMManager();
    this._providerManager = new ProviderManager();
    this._uiItemsProviderRegisteredListener = UiItemsManager.onUiProviderRegisteredEvent.addListener(this._onUiItemProviderRegister);
    this._frontstageReadyListener = FrontstageManager.onFrontstageReadyEvent.addListener(this._onFrontstageReady);
  }

  private _onUiItemProviderRegister = ({ providerId }: UiItemProviderRegisteredEventArgs) => {
    if (!this._providerManager.overrideProviderIds.has(providerId)) {
      const provider = UiItemsManager.getUiItemsProvider(providerId);
      if (provider) {
        this._providerManager.add(provider.id, this._overrideProvider(provider));
      }
    }
    if (this._providerManager.providerIds.has(providerId)) {
      UiItemsManager.unregister(providerId);
      UiItemsManager.unregister(`${providerId}.floating`);
      UiItemsManager.register(this._providerManager.providers.get(providerId)!);
    }
  };

  private _onFrontstageReady = () => {
    this._handleResize(this._container.getBoundingClientRect());
  };

  private _onResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    const frontstage = FrontstageManager.activeFrontstageDef;
    if (frontstage) {
      frontstage.restoreLayout();
      this._widgetDoms.ids.map((id) => {
        frontstage.floatWidget(id, { x: 0, y: 0 }, { height: 0, width: 0 });
      });
      window.requestAnimationFrame(() => {
        const entry = entries[0];
        if (entry) {
          const dimensions = entry.target.getBoundingClientRect();
          this._handleResize(dimensions);
        }
      });
    }
  };

  private _handleResize = async (dimensions: DOMRectReadOnly) => {
    const frontstage = FrontstageManager.activeFrontstageDef;
    if (frontstage) {
      let heightOffset = 16;
      const widgets = (await this._widgetDoms.getDoms()).map((dom) => {
        const rect = dom.element.getBoundingClientRect();
        let height = rect.height + 32;
        height = height > 500 ? 500 : height;
        heightOffset += height + 16;
        return { id: dom.id, point: { x: dimensions.width - 300 - 32, y: dimensions.height - heightOffset }, size: { height, width: 300 } };
      });

      frontstage.restoreLayout();
      widgets.forEach((widget) => {
        frontstage.floatWidget(widget.id, widget.point, widget.size);
      });
    }
  };

  private _getOverrideWidgetComponent = (id: string, content: () => any) => {
    // eslint-disable-next-line react/display-name
    return () => {
      return <div style={{ height: "min-content" }} ref={(devRef) => {
        this._widgetDoms.resolve(id, devRef);
      }}>{createElement(content)}</div>;
    };
  };

  private _overrideProvider(provider: UiItemsProvider) {
    const provideWidgets = provider.provideWidgets?.bind(provider);
    if (provideWidgets) {
      provider.provideWidgets = (stageId: string, stageUsage: string, location: StagePanelLocation, section?: StagePanelSection | undefined) => {
        if (location === StagePanelLocation.Right) {
          const result = provideWidgets(stageId, stageUsage, location, section);
          let updatedWidgets = result.filter((widget) => (widget.defaultState === WidgetState.Floating));
          updatedWidgets = updatedWidgets.map((widget) => {
            this._widgetDoms.add(widget.id!);
            return {
              ...widget,
              // eslint-disable-next-line react/display-name
              getWidgetContent: this._getOverrideWidgetComponent(widget.id!, widget.getWidgetContent),
            };
          });
          const filteredResult = result.filter((widget) => (widget.defaultState !== WidgetState.Floating));
          return [...filteredResult, ...updatedWidgets];
        } else {
          return provideWidgets(stageId, stageUsage, location, section);
        }
      };
    }
    Object.defineProperty(provider, "id", {
      value: `${provider.id}.floating`,
    });
    return provider;
  }

  public dispose = (): void => {
    this._uiItemsProviderRegisteredListener();
    this._frontstageReadyListener();
    this._resizeObserver.disconnect();
  };
}

class WidgetDOMManager {
  private _doms: { id: string, element: Promise<HTMLElement> }[];
  private _resolvers: { [id: string]: (element: HTMLElement) => void };

  constructor() {
    this._doms = [];
    this._resolvers = {};
  }

  public resolve(id: string, element: HTMLElement | null) {
    if (!!this._resolvers[id] && !!element) {
      this._resolvers[id](element);
    }
  }

  public add(id: string) {
    const existing = this._doms.findIndex((dom) => dom.id === id);
    const element = new Promise<HTMLElement>((resolve) => {
      this._resolvers[id] = resolve;
    });
    if (existing > -1) {
      this._doms.splice(existing, 1, { id, element });
    } else {
      this._doms.unshift({ id, element });
    }

  }

  public remove(id: string) {
    const existing = this._doms.findIndex((dom) => dom.id === id);
    if (existing > -1) {
      this._doms.splice(existing, 1);
    }
  }

  public async getDoms() {
    return Promise.all(this._doms.map(async ({ id, element }) => ({ id, element: await element })));
  }

  public get ids() {
    return this._doms.map((dom) => dom.id);
  }
}

class ProviderManager {
  private _providers: Map<string, UiItemsProvider>;

  constructor() {
    this._providers = new Map();
  }

  public add(id: string, provider: UiItemsProvider) {
    this._providers.set(id, provider);
  }

  public get providers() {
    return this._providers;
  }

  public get providerIds() {
    return new Set(this._providers.keys());
  }

  public get overrideProviderIds() {
    return new Set([...this._providers.values()].map((provider) => provider.id));
  }
}
