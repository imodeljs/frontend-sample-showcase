/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { RealityDataWidget } from "./RealityDataWidget";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import RealityDataApp from "./RealityDataApp";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface RealityDataUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  iModelConnection?: IModelConnection;
  showRealityData: boolean;
  realityDataTransparency: number;
  viewportOptions?: IModelViewportControlOptions;
}

export default class RealityDataUI extends React.Component<{}, RealityDataUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      showRealityData: true,
      realityDataTransparency: 0,
    };
    IModelSetup.setIModelList([SampleIModels.ExtonCampus, SampleIModels.MetroStation]);
    this._changeIModel();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the toggle below for displaying the reality data in the model.",
      <RealityDataWidget
        showRealityData={this.state.showRealityData}
        realityDataTransparency={this.state.realityDataTransparency}
        onToggleRealityData={this._onToggleRealityData}
        onChangeRealityDataTransparency={this._onChangeRealityDataTransparency} />
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this._sampleWidgetUiProvider.updateSelector(info.imodelName);
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _onToggleRealityData = async (showRealityData: boolean, realityDataTransparency: number) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        await RealityDataApp.toggleRealityModel(showRealityData, vp, this.state.iModelConnection);
        await RealityDataApp.setRealityDataTransparency(vp, realityDataTransparency);
      }
    }
  };

  private _onChangeRealityDataTransparency = async (realityDataTransparency: number) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        await RealityDataApp.setRealityDataTransparency(vp, realityDataTransparency);
      }
    }
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      await RealityDataApp.toggleRealityModel(this.state.showRealityData, _vp, _vp.iModel);
      await RealityDataApp.setRealityDataTransparency(_vp, this.state.realityDataTransparency);
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ iModelConnection, viewportOptions: { viewState } });
      });
  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={this._uiProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
