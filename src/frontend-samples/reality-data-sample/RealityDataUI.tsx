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

interface RealityDataUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  showRealityData: boolean;
  realityDataTransparency: number;
}

export default class RealityDataUI extends React.Component<{}, RealityDataUIState> {

  constructor(props: any) {
    super(props);
    this.state = {
      showRealityData: true,
      realityDataTransparency: 0,
    };
    IModelSetup.setIModelList([SampleIModels.ExtonCampus, SampleIModels.MetroStation]);
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _getSampleUi = (iModelName: SampleIModels) => {
    return new SampleWidgetUiProvider(
      "Use the toggle below for displaying the reality data in the model.",
      <RealityDataWidget showRealityData={this.state.showRealityData} realityDataTransparency={this.state.realityDataTransparency} />,
      { iModelName, onIModelChange: this._changeIModel }
    );
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      await RealityDataApp.toggleRealityModel(this.state.showRealityData, _vp, _vp.iModel);
      await RealityDataApp.setRealityDataTransparency(_vp, this.state.realityDataTransparency);
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ viewState });
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
            viewportOptions={{ viewState: this.state.viewState }}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName)]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
