/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { ReactNode } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { SampleWidgetContainer } from "./SampleWidgetContainer"
import { IModelSelector } from "../imodel-selector/IModelSelector";

export enum SampleIModels {
  CoffsHarborDemo = "CoffsHarborDemo",
  MetroStation = "Metrostation Sample",
  RetailBuilding = "Retail Building Sample",
  BayTown = "Bay Town Process Plant",
  House = "House Sample",
  Stadium = "Stadium",
  ExtonCampus = "Exton Campus",
  Villa = "Villa",
}

export interface IModelSelectorOptions {
  modelList: SampleIModels[];
  iModelName: SampleIModels;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export class SampleWidgetUiProvider implements UiItemsProvider {
  public readonly id: string = "SampleUiProvider";
  private _widget?: ReactNode;
  private _iModelSelectorOptions?: IModelSelectorOptions;
  private _instructions: string;

  constructor(instructions: string, widget?: ReactNode, iModelSelectorOptions?: IModelSelectorOptions) {
    this._widget = widget;
    this._instructions = instructions;
    this._iModelSelectorOptions = iModelSelectorOptions;
  }

  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (stageId === "DefaultFrontstage" && location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "sampleControlsWidget",
          label: "Sample Controls",
          isFloatingStateSupported: true,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => (<SampleWidgetContainer
            instructions={this._instructions}
            iModelSelector={this._iModelSelectorOptions &&
              <IModelSelector iModelName={this._iModelSelectorOptions.iModelName} iModelNames={this._iModelSelectorOptions?.modelList} onIModelChange={this._iModelSelectorOptions.onIModelChange} />
            }>
            {this._widget}
          </SampleWidgetContainer>),
        }
      );
    }
    return widgets;
  }
}
