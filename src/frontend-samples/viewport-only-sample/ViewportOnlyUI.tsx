/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface ViewportOnlyUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
}

export default class ViewportOnlyUI extends React.Component<{}, ViewportOnlyUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiItemProviders: UiItemsProvider[];

  constructor(props: {}) {
    super(props);
    this.state = {};
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider("Use the toolbar at the top-right to navigate the model.", this._changeIModel);
    this._uiItemProviders = [this._sampleWidgetUiProvider];
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this._sampleWidgetUiProvider.updateSelector(info.imodelName);
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
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
            uiProviders={this._uiItemProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
