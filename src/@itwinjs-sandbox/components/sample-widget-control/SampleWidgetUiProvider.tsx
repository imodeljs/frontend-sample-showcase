/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, ReactElement, ReactNode, useEffect, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { SampleWidgetContainer } from "./SampleWidgetContainer";
import { IModelSelector } from "../imodel-selector/IModelSelector";
import { SampleIModels } from "../../SampleIModels";
import { IModelSetup, onIModelResultEvent } from "@itwinjs-sandbox/imodel/IModelSetup";

export class SampleWidgetUiProvider implements UiItemsProvider {
  public readonly id: string = "SampleUiProvider";
  public static readonly controlsWidgetId: string = "sampleControlsWidget";
  private _widgets: { id: string, label: string, widget: ReactElement<WidgetWrapperProps> }[] = [];
  private _updater: { [id: string]: (props: any) => void } = {};
  private _queue: { [id: string]: any } = {};

  /** Create a SampleWidgetProvider to share sample instructions, controls, and an iModel selector
   * @param instructions - The instructions for the current sample
   * @param controls - A React Node to be used for controlling the current sample
   * @param onIModelChange - A callback in the case that the current iModel changes via the iModelSelector
   * @param iModels - A list of iModels the selector will be populated with (defaults to ALL)
  */
  constructor(instructions: string, controls?: ReactNode, onIModelChange?: onIModelResultEvent, iModels?: SampleIModels[])
  /** Create a SampleWidgetProvider to share sample instructions, controls, and an iModel selector
   * @param instructions - The instructions for the current sample
   * @param onIModelChange - A callback in the case that the current iModel changes via the iModelSelector
   * @param iModels - A list of iModels the selector will be populated with (defaults to ALL)
  */
  constructor(instructions: string, onIModelChange?: onIModelResultEvent, iModels?: SampleIModels[])

  constructor(instructions: string, arg1?: (ReactNode | onIModelResultEvent), arg2?: (onIModelResultEvent | SampleIModels[]), arg3?: SampleIModels[]) {
    const controlsWidget = typeof arg1 !== "function" ? arg1 : undefined;
    const onIModelChange = typeof arg1 === "function" ? arg1 as onIModelResultEvent : typeof arg2 === "function" ? arg2 : undefined;
    const imodels = Array.isArray(arg2) ? arg2 : arg3;

    if (onIModelChange) {
      IModelSetup.onIModelChanged.addListener(onIModelChange);
      IModelSetup.setIModelList(imodels);
    }
    this.addWidget(SampleWidgetUiProvider.controlsWidgetId, "Sample Controls", <SampleControlsWidget instructions={instructions} id={SampleWidgetUiProvider.controlsWidgetId} frontstageId={"defaultFrontstage"}>{controlsWidget}</SampleControlsWidget>);
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
  id: string;
  frontstageId: string;
}

const SampleControlsWidget: FunctionComponent<SampleControlsWidgetProps> = (props) => {
  const [iModelName, setiModelName] = useState<SampleIModels | undefined>(IModelSetup.currentIModel?.iModelName);

  useEffect(() => {
    if (IModelSetup.currentIModel?.iModelName !== iModelName) {
      IModelSetup.changeIModel(iModelName);
    }
  }, [iModelName]);

  useEffect(() => {
    const unsub = IModelSetup.onIModelChanged.addListener((result) => setiModelName(result.iModelName));
    return unsub;
  }, []);

  return (<SampleWidgetContainer
    widgetId={props.id}
    frontstageId={props.frontstageId}
    instructions={props.instructions}
    iModelSelector={iModelName && <IModelSelector iModelName={iModelName} iModelNames={IModelSetup.getIModelList()} onIModelChange={setiModelName} />}>
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
