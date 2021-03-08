/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { ReactNode } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { SampleWidgetContainer } from "./SampleWidgetContainer"
import { SampleSpec, SampleIModels } from "../../sample-spec/SampleSpec";
import { IModelSelector } from "../imodel-selector/IModelSelector";

export interface IModelSelectorOptions {
  iModelName: SampleIModels;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export class SampleWidgetUiProvider implements UiItemsProvider {
  public readonly id: string = "SampleUiProvider";
  private _widget?: ReactNode;
  private _iModelSelectorOptions?: IModelSelectorOptions;
  private _sampleSpec?: SampleSpec;

  constructor(sampleSpec?: SampleSpec, widget?: ReactNode, iModelSelectorOptions?: IModelSelectorOptions) {
    this._widget = widget;
    this._sampleSpec = sampleSpec;
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
            instructions={this._sampleSpec?.instructions}
            iModelSelector={this._iModelSelectorOptions &&
              <IModelSelector iModelName={this._iModelSelectorOptions.iModelName} iModelNames={this._sampleSpec?.modelList} onIModelChange={this._iModelSelectorOptions.onIModelChange} />
            }>
            {this._widget}
          </SampleWidgetContainer>),
        }
      );
    }
    return widgets;
  }
}
