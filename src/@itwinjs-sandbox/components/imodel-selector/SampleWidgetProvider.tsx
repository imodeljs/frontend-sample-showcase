/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { SampleIModels } from "../../SampleIModels";
import { IModelSelector } from "../imodel-selector/IModelSelector";
import { defaultIModelList } from "../../constants";
import "./SampleWidgetProvider.scss";
import { SampleIModelInfo } from "@itwinjs-sandbox/hooks/useSampleIModelConnection";

interface IModelSelectorWidgetProps {
  iModel?: SampleIModelInfo;
  iModels: SampleIModels[];
  onSampleiModelInfoChange: (imodelName: SampleIModels) => void;
}

const SampleIModelSelectorWidget: FunctionComponent<IModelSelectorWidgetProps> = ({ iModel, iModels, onSampleiModelInfoChange }) => {

  return <IModelSelector iModelName={iModel?.iModelName} iModelNames={iModels} onIModelChange={onSampleiModelInfoChange} />;
};

export class SampleWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SampleiModelSelectorWidgetUiProvider";
  public static readonly sampleIModelSelectorWidgetId: string = "SampleiModelSelectorWidget";
  private _iModels: SampleIModels[];
  private _iModel: SampleIModelInfo | undefined;
  private _onSampleiModelInfoChange: (imodelName: SampleIModels) => void;
  private _instructions: string;

  /** Create a SampleWidgetProvider to share sample instructions, controls, and an iModel selector
   * @param onIModelChange - A callback in the case that the current iModel changes via the iModelSelector
   * @param iModels - A list of iModels the selector will be populated with (defaults to ALL)
  */
  constructor(instructions: string, iModels: SampleIModels[] = defaultIModelList, imodelInfo: SampleIModelInfo | undefined, onSampleiModelInfoChange: (imodelName: SampleIModels) => void) {
    this._instructions = instructions;
    this._iModels = iModels;
    this._iModel = imodelInfo;
    this._onSampleiModelInfoChange = onSampleiModelInfoChange;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push({
        id: SampleWidgetProvider.sampleIModelSelectorWidgetId,
        label: "Sample Information",
        defaultState: WidgetState.Floating,
        // eslint-disable-next-line react/display-name
        getWidgetContent: () => (
          <div className="sample-widget-ui">
            <div className="sample-widget-header">
              <div className="sample-instructions">
                <span>{this._instructions}</span>
              </div>
            </div>
            {this._iModels.length > 1 && <hr></hr>}
            {this._iModels.length > 1 && <SampleIModelSelectorWidget iModels={this._iModels} iModel={this._iModel} onSampleiModelInfoChange={this._onSampleiModelInfoChange} />}
          </div>
        ),
      });
    }
    return widgets;
  }
}
