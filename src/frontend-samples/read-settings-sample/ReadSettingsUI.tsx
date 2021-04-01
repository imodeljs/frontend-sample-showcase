/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import "common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import "./index.scss";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { ReadSettingsWidget } from "./ReadSettingsWidget";
import ReadSettingsApp from "./ReadSettingsApp";
import { SettingsResult } from "@bentley/product-settings-client";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { UiItemsProvider } from "@bentley/ui-abstract";

export const settingsKeys = ["Json_Data", "Arbitrary_Text", "CSV_Data"];

interface ReadSettingsState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
  settingKey?: string;
  settingResult?: SettingsResult;
}

export default class ReadSettingsUI extends React.Component<{}, ReadSettingsState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiItemsProviders: UiItemsProvider[];

  constructor(props: {}) {
    super(props);
    this.state = {};
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Choose a Setting Name below to read that setting from the ProductSettingsService",
      <ReadSettingsWidget saveSettings={this._saveSettings} onSettingsChange={this._onSettingsChange} />,
      this.setState.bind(this),
      [SampleIModels.BayTown],
    );
    this._uiItemsProviders = [this._sampleWidgetUiProvider];
  }

  public componentDidUpdate() {
    this._sampleWidgetUiProvider.updateControls({ settingsKey: this.state.settingKey, settingsResult: this.state.settingResult });
  }

  private _readSettings = async (settingKey: string) => {
    const response = await ReadSettingsApp.readSettings(this.state.iModelId!, this.state.contextId!, settingKey);
    this.setState({ settingResult: response });
  };

  private _saveSettings = async (settingsValue: string) => {
    if (this.state.iModelId && this.state.contextId && this.state.settingKey) {
      const response = await ReadSettingsApp.saveSettings(this.state.iModelId, this.state.contextId, this.state.settingKey, settingsValue);
      this.setState({ settingResult: response });
    }
  };

  private _onSettingsChange = async (settingKey: string) => {
    if (this.state.iModelId && this.state.contextId) {
      this.setState({ settingKey });
      await this._readSettings(settingKey);
    }
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    this.setState({ viewportOptions: { viewState } });

    this._onSettingsChange(settingsKeys[0]);
  };

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
            viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={this._uiItemsProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
