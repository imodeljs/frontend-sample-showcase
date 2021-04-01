/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default2DSandboxUi, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ControlsWidget } from "./ViewerOnly2dWidget";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import ViewerOnly2dApp, { ModelLists } from "./ViewerOnly2dApp";
import { ModelProps } from "@bentley/imodeljs-common";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

interface ViewportOnly2dUIState {
  imodelName?: SampleIModels;
  contextId?: string;
  imodelId?: string;
  iModelConnection?: IModelConnection;
  viewportOptions?: IModelViewportControlOptions;
  modelLists: ModelLists;
}

export default class ViewportOnly2dUI extends React.Component<{}, ViewportOnly2dUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiItemProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      modelLists: {
        sheets: [],
        drawings: [],
      },
    };
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "The picker below shows a list of 2D models in this iModel.",
      <ControlsWidget drawings={this.state.modelLists.drawings} sheets={this.state.modelLists.sheets} onSelectionChange={this._onSelectionChange} />,
      this.setState.bind(this),
      [SampleIModels.House, SampleIModels.MetroStation]
    );
    this._uiItemProviders = [this._sampleWidgetUiProvider];
  }

  public componentDidUpdate() {
    this._sampleWidgetUiProvider.updateControls({ drawings: this.state.modelLists.drawings, sheets: this.state.modelLists.sheets });
  }

  private _onSelectionChange = (modelProps: ModelProps) => {
    if (this.state.iModelConnection) {
      ViewerOnly2dApp.changeViewportView(this.state.iModelConnection, modelProps);
    }
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const result = await ViewerOnly2dApp.get2DModels(iModelConnection);
    const { sheets, drawings } = result;
    this.setState({ iModelConnection, modelLists: { sheets, drawings } });
    const viewState = await ViewerOnly2dApp.createDefaultViewFor2dModel(iModelConnection, drawings[0]);
    this.setState({ viewportOptions: { viewState } });
  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.imodelName && this.state.contextId && this.state.imodelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.imodelId}
            viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default2DSandboxUi}
            theme="dark"
            uiProviders={this._uiItemProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
