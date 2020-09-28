/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { ChangeEvent } from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Button, DisabledText, SmallText, Spinner, SpinnerSize, Textarea } from "@bentley/ui-core";
import "./index.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";

import { SettingsResult, SettingsStatus } from "@bentley/product-settings-client";
import ReadSettingsApp from "./ReadSettingsApp";

/** React props */
interface ReadSettingsProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
export interface ReadSettingsState {
  settingKey?: string;
  settingValue?: string;
  settingResult?: SettingsResult;
  imodel?: IModelConnection;
  saveInProgress: boolean;
  status?: string;
  settingsInitialized: boolean
}

const settingsKeys = ["Json_Data", "Arbitrary_Text", "CSV_Data"];

/** A React component that renders the UI specific for this sample */
export default class ReadSettingsUI extends React.Component<ReadSettingsProps, ReadSettingsState> {

  /** Creates an Sample instance */
  constructor(props: ReadSettingsProps) {
    super(props);
    this.state = {
      saveInProgress: false,
      settingsInitialized: false,
    };
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleSettingsValueChange = this.handleSettingsValueChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
  }

  private onIModelReady = (imodel: IModelConnection) => {

    ReadSettingsApp.readSettings(settingsKeys[0]).then((response) => {
      this.setState({
        imodel: imodel,
        settingResult: response,
        settingValue: this.parseSettingsValue(settingsKeys[0], response.setting),
        settingsInitialized: true,
      });
    })
  }

  private parseSettingsValue(name: string, value: string) {
    let _value;
    switch (name) {
      case settingsKeys[0]:
        _value = JSON.stringify(value || "", null, "   ");
        break;
      default:
        _value = value || "";
    }
    return _value
  }

  // Handler to read external settings when name in dropdown changes
  private handleSettingsChange(event: ChangeEvent<HTMLSelectElement>) {
    const settingKey = event.target.value;
    this.setState({ settingKey });
    ReadSettingsApp.readSettings(settingKey).then((response) => {
      this.setState({
        settingResult: response,
        settingValue: this.parseSettingsValue(settingKey, response.setting),
      });
    });
  }

  // Handler to get settings value into state, when you modify textarea element in the dialog
  private handleSettingsValueChange(event: any) {
    const settingValue = event.target.value;
    this.setState({ settingValue });
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  private saveSettings() {
    this.setState({ saveInProgress: true });
    ReadSettingsApp.saveSettings(this.state.settingKey!, this.state.settingValue!).then((response) => {
      this.setState({
        settingResult: response,
        saveInProgress: false,
      });
    });
  }

  // Helper method to show status get/write operations with external setting in the dialog
  private showStatus() {
    if (!this.state.settingResult || this.state.settingResult.status === SettingsStatus.Success) {
      return (<div></div>);
    }

    return (
      <div style={{ lineBreak: "anywhere", overflowWrap: "break-word", maxWidth: "30vw" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          {`${this.state.settingResult.status} ${this.state.settingResult.errorMessage}`}
        </SmallText>
      </div>
    );
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    const entries = settingsKeys.map((value, index) => <option key={index} value={value}>{value}</option>);
    return !this.state.settingsInitialized ? (<div style={{ width: "395px" }}><Spinner size={SpinnerSize.Small} /> loading...</div>) : (
      <>
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span>Settings Name:</span>
          <select placeholder="Browse by name..." value={this.state.settingKey} onChange={this.handleSettingsChange} style={{ width: "fit-content" }}>
            {entries}
          </select>
        </div>
        <Textarea rows={10} key="test" placeholder="" className="uicore-full-width" value={this.state.settingValue} onChange={this.handleSettingsValueChange} />
        {this.showStatus()}
        <div style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {this.state.saveInProgress ?
            (<div ><Spinner size={SpinnerSize.Small} /> Saving...</div>) :
            <Button onClick={this.saveSettings} disabled={!this.state.settingKey}>Save settings</Button>
          }
        </div>
        <DisabledText>Note: save does not work in this read-only environment.</DisabledText><br />
        <DisabledText>Forbidden error is expected.</DisabledText>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Choose a Setting Name below to read that setting from the ProductSettingsService" controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
