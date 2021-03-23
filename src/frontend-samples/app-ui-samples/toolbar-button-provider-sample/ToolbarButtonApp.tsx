/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ToolbarButtonProvider } from "./ToolbarButtonUi";
import "common/samples-common.scss";
import "common/AppUi/app-ui.scss";
import { AuthorizationClient, default3DAppUi, defaultIModelList, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";

interface ToolbarButtonSampleState {
  iModelName?: SampleIModels,
  contextId?: string,
  iModelId?: string,
  viewState?: ViewState,
}

export default class ToolbarButtonSample extends React.Component<{}, ToolbarButtonSampleState> {
  private _toolbarUiProvider = new ToolbarButtonProvider();

  constructor(props: {}) {
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
      "Press the Lightbulb button tool at the top of the screen.",
      undefined,
      { iModelName, onIModelChange: this._changeIModel }
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
            defaultUiConfig={default3DAppUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName), this._toolbarUiProvider]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
