/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleGallery } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "../../common/samples-common.scss";
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector } from "../IModelSelector/IModelSelector";
import SampleEditor, { InternalFile } from "../SampleEditor/SampleEditor";
import { ActivityBar, ActivityBarItem, SplitScreen } from "@bentley/monaco-editor";

// cSpell:ignore imodels

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  files?: InternalFile[];
  customModelList?: string[];
  setup?: (iModelName: string) => Promise<React.ReactNode>;
  teardown?: () => void;
}

interface ShowcaseState {
  iModelName: string;
  activeSampleGroup: string;
  activeSampleName: string;
  sampleUI?: React.ReactNode;
  showEditor: boolean;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
  private _samples = sampleManifest;

  constructor(props?: any, context?: any) {
    super(props, context);

    const names = this.getNamesFromURLParams();

    this.state = {
      iModelName: IModelSelector.defaultIModel,
      activeSampleGroup: names.group,
      activeSampleName: names.sample,
      showEditor: false,
    };

    this.onEditorButtonClick = this.onEditorButtonClick.bind(this);
  }

  private getNamesFromURLParams(): { group: string, sample: string } {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGroupName = urlParams.get("group");
    const urlSampleName = urlParams.get("sample");

    let namesAreValid = false;
    let group = "";
    let sample = "";

    if (urlGroupName && urlSampleName) {
      namesAreValid = undefined !== this.getSampleByName(urlGroupName, urlSampleName);
      group = urlGroupName;
      sample = urlSampleName;
    }

    if (!namesAreValid) {
      group = this._samples[0].groupName;
      sample = this._samples[0].samples[0].name;
    }

    return { group, sample };
  }

  public componentDidMount() {
    // tslint:disable-next-line no-floating-promises
    this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName);

    document.documentElement.setAttribute("data-theme", "dark");
  }

  private getSampleByName(groupName: string, sampleName: string): SampleSpec | undefined {
    const group = sampleManifest.find((v) => v.groupName === groupName);

    if (!group)
      return undefined;

    return group.samples.find((v) => v.name === sampleName)!;
  }

  private getIModelList(sampleSpec: SampleSpec): string[] {
    const customModelList = sampleSpec.customModelList;
    return customModelList ? customModelList : IModelSelector.defaultIModelList;
  }

  private async setupNewSample(groupName: string, sampleName: string) {

    const newSampleSpec = this.getSampleByName(groupName, sampleName);
    if (undefined === newSampleSpec) {
      this.setState({ activeSampleGroup: "", activeSampleName: "" });
      return;
    }

    let sampleUI: React.ReactNode;
    let iModelName = this.state.iModelName;

    if (newSampleSpec && newSampleSpec.setup) {

      if (newSampleSpec.name !== this.state.activeSampleName) {
        iModelName = this.getIModelList(newSampleSpec)[0];
      }
      sampleUI = await newSampleSpec.setup(iModelName);
    }

    this.setState({ activeSampleGroup: groupName, activeSampleName: sampleName, sampleUI, iModelName }, () => {
      const params = new URLSearchParams();
      params.append("group", groupName);
      params.append("sample", sampleName);

      const url = window.location;
      const newUrl = url.protocol + "//" + url.host + "?" + params.toString();
      window.history.replaceState(null, "Title", newUrl);
    });
  }

  private _onActiveSampleChange = (groupName: string, sampleName: string) => {
    const oldSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    if (undefined !== oldSample && oldSample.teardown)
      oldSample.teardown();

    // tslint:disable-next-line no-floating-promises
    this.setupNewSample(groupName, sampleName);
  }

  private onIModelChange = (iModelName: string) => {
    this.setState({ iModelName }, () => this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName));
  }

  private onEditorButtonClick() {
    this.setState((prevState) => ({ showEditor: !prevState.showEditor }));
  }

  public render() {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    const modelList = activeSample ? this.getIModelList(activeSample) : null;
    const files = activeSample ? activeSample.files : undefined;

    return (
      <div className="showcase">
        <SplitScreen style={{ position: "relative" }} size={48} allowResize={false} resizerStyle={{ cursor: "default" }} pane1Style={{ display: "flex" }}>
          <ActivityBar>
            <ActivityBarItem onClick={this.onEditorButtonClick} active={this.state.showEditor}>
              <div className="codicon codicon-json" style={{ fontSize: "24px" }} />
            </ActivityBarItem>
          </ActivityBar>
          <SplitScreen style={{ position: "relative" }} minSize={500} pane1Style={this.state.showEditor ? undefined : { width: 0 }}>
            <SampleEditor files={files} />
            <div style={{ height: "100%" }}>
              <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
                {this.state.sampleUI}
              </div>
              {modelList && 1 < modelList.length &&
                <div className="model-selector">
                  <IModelSelector iModelNames={modelList} iModelName={this.state.iModelName} onIModelChange={this.onIModelChange} />
                </div>
              }
            </div>
          </SplitScreen>
        </SplitScreen>
        <SampleGallery samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onActiveSampleChange} />
      </div>
    );
  }
}
