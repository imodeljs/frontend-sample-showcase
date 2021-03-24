/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default2DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ControlsWidget } from "./ViewerOnly2dWidget";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import ViewerOnly2dApp from "./ViewerOnly2dApp";
import { ModelProps } from "@bentley/imodeljs-common";
export interface TwoDState {
  sheets: ModelProps[];
  drawings: ModelProps[];
}

interface ViewportOnly2dUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  modelLists: TwoDState;
}

export default class ViewportOnly2dUI extends React.Component<{}, ViewportOnly2dUIState> {

  constructor(props: any) {
    super(props);
    this.state = {
      modelLists: {
        sheets: [],
        drawings: [],
      },
    };
    IModelSetup.setIModelList([SampleIModels.House, SampleIModels.MetroStation]);
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
      "The picker below shows a list of 2D models in this iModel.",
      <ControlsWidget drawings={this.state.modelLists.drawings} sheets={this.state.modelLists.sheets} />,
      { iModelName, onIModelChange: this._changeIModel }
    );
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const result = await ViewerOnly2dApp.get2DModels(iModelConnection);
    const { sheets, drawings } = result;
    this.setState({ modelLists: { sheets, drawings } });
    const viewState = await ViewerOnly2dApp.createDefaultViewFor2dModel(iModelConnection, drawings[0]);
    this.setState({ viewState });
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
            defaultUiConfig={default2DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName)]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
