/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { ReactNode } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { SampleWidgetContainer } from "./SampleWidgetContainer";
import { IModelSelector } from "../imodel-selector/IModelSelector";
import { SampleIModels } from "../../SampleIModels";
import { IModelSetup } from "@itwinjs-sandbox/imodel/IModelSetup";

export interface IModelSelectorOptions {
  iModelName: SampleIModels;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export class SampleWidgetUiProvider implements UiItemsProvider {
  public readonly id: string = "SampleUiProvider";
  private _initialized = false;
  private _widget?: ReactNode;
  private _iModelSelectorOptions?: IModelSelectorOptions;
  private _instructions: string;
  private _additionalWidgets: AbstractWidgetProps[] = [];

  constructor(instructions: string, widget?: ReactNode, iModelSelectorOptions?: IModelSelectorOptions) {
    this._widget = widget;
    this._instructions = instructions;
    this._iModelSelectorOptions = iModelSelectorOptions;
  }

  public addWidget(widget: AbstractWidgetProps) {
    this._additionalWidgets.push(widget);
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "sampleControlsWidget",
          label: "Sample Controls",
          isFloatingStateSupported: true,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => (<SampleWidgetContainer
            frontstageId={"DefaultFrontstage"}
            widgetId={"sampleControlsWidget"}
            instructions={this._instructions}
            iModelSelector={this._iModelSelectorOptions &&
              <IModelSelector iModelName={this._iModelSelectorOptions.iModelName} iModelNames={IModelSetup.getIModelList()} onIModelChange={this._iModelSelectorOptions.onIModelChange} />
            }>
            {this._widget}
          </SampleWidgetContainer>),
        },
        ...this._additionalWidgets
      );
    }
    return widgets;
  }
}
