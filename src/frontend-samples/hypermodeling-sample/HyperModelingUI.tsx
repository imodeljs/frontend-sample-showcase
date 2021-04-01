/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface HyperModelingUIState {
  imodelName?: SampleIModels;
  contextId?: string;
  imodelId?: string;
  viewState?: ViewState;
}

export default class HyperModelingUI extends React.Component<{}, HyperModelingUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiItemProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {};
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Click on a marker to toggle the section or return to the 3d view.",
      this.setState.bind(this),
      [SampleIModels.House]
    );
    this._uiItemProviders = [this._sampleWidgetUiProvider];
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
            uiProviders={this._uiItemProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
