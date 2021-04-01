/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ToolbarButtonProvider } from "./ToolbarButtonUi";
import "common/samples-common.scss";
import "common/AppUi/app-ui.scss";
import { AuthorizationClient, default3DAppUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

interface ToolbarButtonSampleState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
}

export default class ToolbarButtonSample extends React.Component<{}, ToolbarButtonSampleState> {
  private _toolbarUiProvider = new ToolbarButtonProvider();
  private _sampleWidgetProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: {}) {
    super(props);
    this.state = {};
    this._sampleWidgetProvider = new SampleWidgetUiProvider("Press the Lightbulb button tool at the top of the screen.", this.setState.bind(this));
    this._uiProviders = [this._sampleWidgetProvider, this._toolbarUiProvider];
  }

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    this.setState({ viewportOptions: { viewState } });
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
            defaultUiConfig={default3DAppUi}
            theme="dark"
            uiProviders={this._uiProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
