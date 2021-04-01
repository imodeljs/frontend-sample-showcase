/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, ReactElement, ReactNode, useEffect, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { SampleWidgetContainer } from "./SampleWidgetContainer";
import { IModelSelector } from "../imodel-selector/IModelSelector";
import { SampleIModels } from "../../SampleIModels";
import { IModelSetup } from "@itwinjs-sandbox/imodel/IModelSetup";

type ChangeIModelFunction = (iModelName: SampleIModels) => void;

export class SampleWidgetUiProvider implements UiItemsProvider {
  public readonly id: string = "SampleUiProvider";
  public static readonly controlsWidgetId: string = "sampleControlsWidget";
  private _widgets: { id: string, label: string, widget: ReactElement<WidgetWrapperProps> }[] = [];
  private _updater: { [id: string]: (props: any) => void } = {};
  private _queue: { [id: string]: any } = {};

  constructor(instructions: string, controls?: ReactNode, onIModelChange?: ChangeIModelFunction)
  constructor(instructions: string, onIModelChange?: ChangeIModelFunction)

  constructor(instructions: string, arg1?: (ReactNode | ChangeIModelFunction), arg2?: ChangeIModelFunction) {
    let controlsWidget, onIModelChange;
    if (!arg2 && typeof arg1 === "function") {
      onIModelChange = arg1 as ChangeIModelFunction;
    } else {
      controlsWidget = arg1;
      onIModelChange = arg2;
    }
    this.addWidget(SampleWidgetUiProvider.controlsWidgetId, "Sample Controls", <SampleControlsWidget instructions={instructions} onIModelChange={onIModelChange}>{controlsWidget}</SampleControlsWidget>);
  }

  public addWidget(id: string, label: string, widget: ReactNode) {
    const widgetProps = this._widgets.find((props) => props.id === id);
    if (!widgetProps) {
      const props = React.isValidElement(widget) ? widget.props : undefined;
      this._widgets.push({
        id,
        label,
        widget: <WidgetWrapper id={id} setUpdater={(fn) => this._updater[id] = fn} widget={widget} props={props} onRender={this._onRender} />,
      });
    }
  }

  public updateWidget(id: string, props: any) {
    if (this._updater[id]) {
      this._updater[id](props);
    } else {
      this._queue[id] = props;
    }
    const widgetIndex = this._widgets.findIndex((widget) => widget.id === id);
    if (widgetIndex >= 0) {
      const widget = this._widgets[widgetIndex].widget.props.widget;
      const updatedProps = React.isValidElement(widget) ? { ...widget.props, ...props } : undefined;
      const updatedWidget = React.isValidElement(widget) ? React.cloneElement(widget, updatedProps) : widget;
      this._widgets[widgetIndex] = {
        ...this._widgets[widgetIndex],
        widget: <WidgetWrapper id={id} setUpdater={(fn) => this._updater[id] = fn} widget={updatedWidget} props={updatedProps} onRender={this._onRender} />,
      };
    }
  }

  public updateSelector(iModelName: SampleIModels) {
    this.updateWidget(SampleWidgetUiProvider.controlsWidgetId, { iModelName });
  }

  public updateControls(props: any) {
    const index = this._widgets.findIndex((widget) => widget.id === SampleWidgetUiProvider.controlsWidgetId);
    let children = (this._widgets[index].widget.props.widget as ReactElement).props.children;
    children = React.cloneElement(children, { ...children.props, ...props });
    this.updateWidget(SampleWidgetUiProvider.controlsWidgetId, { children });
  }

  private _onRender = (id: string) => {
    if (this._queue[id]) {
      this._updater[id](this._queue[id]);
      delete this._queue[id];
    }
  };

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      this._widgets.forEach((def) => {
        widgets.push({
          id: def.id,
          label: def.label,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => def.widget,
        });
      });
    }
    return widgets;
  }
}

interface SampleControlsWidgetProps {
  instructions: string;
  iModelName?: SampleIModels;
  onIModelChange?: ChangeIModelFunction;
}

const SampleControlsWidget: FunctionComponent<SampleControlsWidgetProps> = (props) => {
  return (<SampleWidgetContainer
    instructions={props.instructions}
    iModelSelector={props.iModelName && props.onIModelChange && <IModelSelector iModelName={props.iModelName} iModelNames={IModelSetup.getIModelList()} onIModelChange={props.onIModelChange} />}>
    {props.children}
  </SampleWidgetContainer>);
};

interface WidgetWrapperProps {
  id: string;
  widget: ReactNode;
  props?: any;
  setUpdater: (fn: (props: any) => void) => void;
  onRender: (id: string) => void;
}

const WidgetWrapper: FunctionComponent<WidgetWrapperProps> = ({ id, widget, setUpdater, props: incomingProps, onRender }) => {
  const [props, setProps] = useState(incomingProps);
  useEffect(() => {
    setUpdater((newProps) => {
      setProps({ ...props, ...newProps });
    });
  }, [setUpdater, props]);

  useEffect(() => {
    setProps(incomingProps);
  }, [incomingProps]);

  useEffect(() => {
    onRender(id);
  }, [id, onRender]);

  return <>{React.isValidElement(widget) ? React.cloneElement(widget, props) : widget}</>;
};
