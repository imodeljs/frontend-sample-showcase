/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection, AuthorizedFrontendRequestContext, IModelApp } from "@bentley/imodeljs-frontend";
import { Button, LabeledTextarea, Spinner, SpinnerSize, LabeledSelect, SmallText, DisabledText } from "@bentley/ui-core";
import "./index.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";
import { ChangeEvent } from "react";
import { SettingsResult, SettingsStatus } from "@bentley/product-settings-client";

/** React props */
interface ExternalSettingsProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
export interface ExternalSettingsState {
  settingKey?: string;
  settingValue?: string;
  settingResult?: SettingsResult;
  imodel?: IModelConnection;
  projectId?: string;
  imodelId?: string;
  saveInProgress: boolean;
  status?: string;
}

const namespace = 'showcase';

/** A React component that renders the UI specific for this sample */
export default class ExternalSettingsUI extends React.Component<ExternalSettingsProps, ExternalSettingsState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      saveInProgress: false
    };
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleSettingsValueChange = this.handleSettingsValueChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
    AuthorizedFrontendRequestContext.create().then(async context => {
      const imodelInfo = await this.getIModelInfo(this.props.iModelName, context);
      this.setState({ projectId: imodelInfo.projectId, imodelId: imodelInfo.imodelId });
    });
  }

  // This method serves to query projectId of project where iModel is stored in this example, 
  // however in real application you might have it upfront
  private async getIModelInfo(iModelName: string, context: AuthorizedFrontendRequestContext): Promise<{ projectId: string, imodelId: string }> {
    // In testdrive the projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;
    const connectClient = new ContextRegistryClient();
    let project: Project;

    try {
      project = await connectClient.getProject(context, { $filter: `Name+eq+'${iModelName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(context, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);

    return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }

  // Handler to read external settings when name in dropdown changes
  handleSettingsChange(event: ChangeEvent<HTMLSelectElement>) {
    const settingKey = event.target.value;
    this.setState({ settingKey: settingKey });

    AuthorizedFrontendRequestContext.create().then(async context => {
      const response = await IModelApp.settings.getSetting(context, namespace, settingKey, true, this.state.projectId, this.state.imodelId);
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
  // However saveSetting method will work in your project with signed-in user, who has required permissions in the project.
  saveSettings() {
    this.setState({ saveInProgress: true });
    AuthorizedFrontendRequestContext.create().then(async context => {
      const response = await IModelApp.settings.saveSetting(context, this.state.settingValue, namespace, this.state.settingKey!, true, this.state.projectId, this.state.imodelId);
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
        <ControlPane instructions="Demonstrating read and write of custom settings" controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
