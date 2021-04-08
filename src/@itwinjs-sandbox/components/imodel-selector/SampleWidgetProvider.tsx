/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { IModelSelector } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";
import { defaultIModelList } from "@itwinjs-sandbox/constants";
import { useSampleIModelParameter } from "@itwinjs-sandbox/hooks/useSampleIModelParameter";
import "./SampleWidgetProvider.scss";

interface IModelSelectorWidgetProps {
  iModels: SampleIModels[];
  onSampleiModelInfoChange: (imodelName: SampleIModels) => void;
}

const SampleIModelSelectorWidget: FunctionComponent<IModelSelectorWidgetProps> = ({ iModels, onSampleiModelInfoChange }) => {
  const [iModelParam] = useSampleIModelParameter();
  const [iModelName, setiModelName] = useState<SampleIModels>(iModelParam);

  useEffect(() => {
    if (iModelName) {
      onSampleiModelInfoChange(iModelName);
    }
  });

  return <IModelSelector iModelName={iModelName} iModelNames={iModels} onIModelChange={setiModelName} />;
};

export class SampleWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SampleiModelSelectorWidgetUiProvider";
  public static readonly sampleIModelSelectorWidgetId: string = "SampleiModelSelectorWidget";
  private _iModels: SampleIModels[];
  private _onSampleiModelInfoChange: (imodelName: SampleIModels) => void;
  private _instructions: string;

  /** Create a SampleWidgetProvider to share sample instructions, controls, and an iModel selector
   * @param onIModelChange - A callback in the case that the current iModel changes via the iModelSelector
   * @param iModels - A list of iModels the selector will be populated with (defaults to ALL)
  */
  constructor(instructions: string, iModels: SampleIModels[] = defaultIModelList, onSampleiModelInfoChange: (imodelName: SampleIModels) => void) {
    this._instructions = instructions;
    this._iModels = iModels;
    this._onSampleiModelInfoChange = onSampleiModelInfoChange;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push({
        id: SampleWidgetProvider.sampleIModelSelectorWidgetId,
        label: "iModel Selector",
        defaultState: WidgetState.Floating,
        // eslint-disable-next-line react/display-name
        getWidgetContent: () => (
          <div className="sample-widget-ui">
            <div className="control-pane-header">
              <div className="sample-instructions">
                <span>{this._instructions}</span>
              </div>
            </div>
            {this._iModels.length && <hr></hr>}
            {this._iModels.length && <SampleIModelSelectorWidget iModels={this._iModels} onSampleiModelInfoChange={this._onSampleiModelInfoChange} />}
          </div>
        ),
      });
    }
    return widgets;
  }
}
