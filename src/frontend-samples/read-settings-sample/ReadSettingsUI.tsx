/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { Button, LabeledTextarea, Spinner, SpinnerSize, LabeledSelect, SmallText, DisabledText } from "@bentley/ui-core";
import "./index.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ChangeEvent } from "react";
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
}

/** A React component that renders the UI specific for this sample */
export default class ReadSettingsUI extends React.Component<ReadSettingsProps, ReadSettingsState> {

  /** Creates an Sample instance */
  constructor(props: ReadSettingsProps) {
    super(props);
    this.state = {
      saveInProgress: false
    };
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleSettingsValueChange = this.handleSettingsValueChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
  }

  // Handler to read external settings when name in dropdown changes
  handleSettingsChange(event: ChangeEvent<HTMLSelectElement>) {
    const settingKey = event.target.value;
    this.setState({ settingKey: settingKey });

    ReadSettingsApp.readSettings(settingKey).then(response => {
      let value;

      switch (settingKey) {
        case 'Json_Data':
          value = JSON.stringify(response.setting || '', null, '   ');
          break;
        default:
          value = response.setting || ''
      }

      this.setState({
        settingResult: response,
        settingValue: value
      });
    });
  }

  // Handler to get settings value into state, when you modify textarea element in the dialog
  handleSettingsValueChange(event: any) {
    const settingValue = event.target.value;
    this.setState({ settingValue: settingValue });
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden. 
  saveSettings() {
    this.setState({ saveInProgress: true });
    ReadSettingsApp.saveSettings(this.state.settingKey!, this.state.settingValue!).then(response => {
      this.setState({
        settingResult: response,
        saveInProgress: false
      });
    });
  }

  // Helper method to show status get/write operations with external setting in the dialog
  private showStatus() {
    if (!this.state.settingResult || this.state.settingResult.status == SettingsStatus.Success) {
      return (<div></div>);
    }

    return (
      <div style={{ lineBreak: 'anywhere', overflowWrap: 'break-word', maxWidth: '30vw' }}>
        <SmallText style={{ color: 'var(--foreground-alert)' }}>
          {`${this.state.settingResult.status} ${this.state.settingResult.errorMessage}`}
        </SmallText>
      </div>
    );
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <LabeledSelect label="Settings Name:" options={["Json_Data", "Arbitrary_Text", "CSV_Data"]} placeholder="Browse by name..." value={this.state.settingKey} onChange={this.handleSettingsChange} />
        <LabeledTextarea rows={10} key="test" label="Settings Value:" placeholder="" className="uicore-full-width" value={this.state.settingValue} onChange={this.handleSettingsValueChange} />
        {this.showStatus()}
        <div style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {this.state.saveInProgress ?
            (<div ><Spinner size={SpinnerSize.Small} /> Saving...</div>) :
            <Button onClick={this.saveSettings} disabled={!this.state.settingKey}>Save settings</Button>
          }
        </div>
        <DisabledText>Note: save doesn't work in this read-only environment.</DisabledText><br />
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
