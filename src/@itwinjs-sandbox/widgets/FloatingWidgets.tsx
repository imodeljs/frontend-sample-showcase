/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { FrontstageReadyEventArgs, UiFramework, WidgetDef, WidgetState } from "@bentley/ui-framework";
import { CSSProperties, ReactNode } from "react";
import ReactDOM from "react-dom";

const containerStyle: CSSProperties = {
  padding: "8px",
  display: "block",
  position: "absolute",
  visibility: "hidden",
  zIndex: -1,
};

const setStyleAttribute = (element: HTMLElement, attrs: { [key: string]: any }) => {
  if (attrs !== undefined) {
    Object.keys(attrs).forEach((key: string) => {
      element.style.setProperty(key, attrs[key]);
    });
  }
};

export class FloatingWidgetsManager {

  public static onFrontstageReadyListener = async (ev: FrontstageReadyEventArgs) => {
    const uiSettings = UiFramework.getUiSettings();
    const widgets = ev.frontstageDef.rightPanel?.widgetDefs.filter((widget) => widget.state === WidgetState.Floating).reverse() || [];

    await uiSettings.deleteSetting("uifw-frontstageSettings", `frontstageState[${ev.frontstageDef.id}]`);
    ev.frontstageDef.restoreLayout();

    widgets.map((widget) => ev.frontstageDef.floatWidget(widget.id, undefined, { height: 0, width: 0 }));
    const props = widgets.map((widget) => ({ widget, props: FloatingWidgetsManager._getWidgetProps(widget, IModelApp.viewManager.selectedView!) }));

    await uiSettings.deleteSetting("uifw-frontstageSettings", `frontstageState[${ev.frontstageDef.id}]`);
    ev.frontstageDef.restoreLayout();

    let continuousHight = 16;
    const minWidth = Math.max(...props.map((pos) => pos.props.width));
    const minX = Math.min(...props.map((pos) => pos.props.x)) - 32;
    props.map((pos,) => {
      ev.frontstageDef.floatWidget(pos.widget.id, { x: minX, y: pos.props.y - continuousHight }, { height: pos.props.height, width: minWidth });
      continuousHight += (pos.props.height + 16);
    });
  };

  private static _measureDomNode(node: ReactNode) {
    const container = document.createElement("div");
    setStyleAttribute(container, containerStyle);

    document.body.appendChild(container);

    // Renders the React element into the hidden div
    ReactDOM.render(node as any, container);

    // Gets the element size
    const height = container.clientHeight;
    const width = container.clientWidth;

    // Removes the element and its wrapper from the document
    ReactDOM.unmountComponentAtNode(container);
    container.parentNode!.removeChild(container);
    return { height, width };
  }

  private static _getWidgetProps = (widget: WidgetDef, vp: Viewport) => {
    const vpDims = vp.viewRect;
    const { height, width } = FloatingWidgetsManager._measureDomNode(widget.reactNode);
    const adjustedHeight = height + 30;
    return { height: adjustedHeight, width, x: (vpDims.right - width), y: vpDims.bottom - adjustedHeight };
  };

}
