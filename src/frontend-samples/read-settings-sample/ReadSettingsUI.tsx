/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import "common/samples-common.scss";
import { AuthorizedFrontendRequestContext, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import "./index.scss";
import { Viewer } from "@bentley/itwin-viewer-react";
import { SampleIModels, IModelSetup, SampleWidgetUiProvider, ViewSetup, AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import ReadSettingsApp from "./ReadSettingsApp";
import { ReadSettingsWidget } from "./ReadSettingsWidget";

interface ReadSettingsState {
  iModelName?: SampleIModels,
  contextId?: string,
  iModelId?: string,
  viewState?: ViewState,
}

export default class ReadSettingsUI extends React.Component<{}, ReadSettingsState> {

  constructor(props: {}) {
    super(props);
    this.state = {};
    IModelSetup.setIModelList([SampleIModels.BayTown]);
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then(async (info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _getSampleUi = () => {
    return new SampleWidgetUiProvider(
      "Choose a Setting Name below to read that setting from the ProductSettingsService",
      <ReadSettingsWidget />
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
            productId="2686"
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            viewportOptions={{ viewState: this.state.viewState }}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi()]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
