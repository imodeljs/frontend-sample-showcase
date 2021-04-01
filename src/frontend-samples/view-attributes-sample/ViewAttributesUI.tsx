/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ViewAttributesWidget } from "./ViewAttributesWidget";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";

interface ViewAttributesUIState {
  imodelName?: SampleIModels;
  contextId?: string;
  imodelId?: string;
  viewState?: ViewState;
}

export default class ViewAttributesUI extends React.Component<{}, ViewAttributesUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;

  constructor(props: any) {
    super(props);
    this.state = {};
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider("Use the toggle below for displaying the reality data in the model.", <ViewAttributesWidget />, this.setState.bind(this));
  }

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
        {this.state.imodelName && this.state.contextId && this.state.imodelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.imodelId}
            viewportOptions={{ viewState: this.state.viewState }}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={[this._sampleWidgetUiProvider]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }

}
