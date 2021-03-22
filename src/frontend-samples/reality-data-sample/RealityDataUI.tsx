/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { RealityDataWidget } from "./RealityDataWidget";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";

interface RealityDataUIState {
  iModelName?: SampleIModels,
  contextId?: string,
  iModelId?: string,
  viewState?: ViewState,
}

export default class RealityDataUI extends React.Component<{}, RealityDataUIState> {

  constructor(props: any) {
    super(props);
    this.state = {};
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
      <RealityDataWidget />,
      { modelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation], iModelName, onIModelChange: this._changeIModel }
    )
  }

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ viewState })
      })
  }

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
