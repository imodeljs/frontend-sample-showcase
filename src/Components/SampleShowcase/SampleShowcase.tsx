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
import SampleEditor from "../SampleEditor/SampleEditor";
import { ActivityBar, ActivityBarItem, InternalFile, SplitScreen } from "@bentley/monaco-editor";

// cSpell:ignore imodels

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  files?: InternalFile[];
  customModelList?: string[];
  setup?: (iModelName: string, iModelSelector?: React.ReactNode) => Promise<React.ReactNode>;
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
    this.onSampleTranspiled = this.onSampleTranspiled.bind(this);
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

  private getIModelSelector(iModelName: string, iModelList: string[]): React.ReactNode {
    if (iModelList && 1 < iModelList.length)
      return (
        <div className="model-selector">
          <IModelSelector iModelNames={iModelList} iModelName={iModelName} onIModelChange={this.onIModelChange} />
        </div>);
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
      const iModelList = this.getIModelList(newSampleSpec);

      if (newSampleSpec.name !== this.state.activeSampleName) {
        iModelName = iModelList[0];
      }
      sampleUI = await newSampleSpec.setup(iModelName, this.getIModelSelector(iModelName, iModelList));
    }

    this.setState({ activeSampleGroup: groupName, activeSampleName: sampleName, sampleUI, iModelName }, () => {
      const params = new URLSearchParams();
      params.append("group", groupName);
      params.append("sample", sampleName);

      window.history.replaceState(null, "", "?" + params.toString());
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

  private async onSampleTranspiled(blob: string) {
    // tslint:disable-next-line: variable-name
    const SampleUi = React.lazy(() => import( /* webpackIgnore: true */ blob));
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
    const oldSetup = activeSample.setup;
    activeSample.setup = async (iModelName: string) => {
      if (oldSetup) {
        await oldSetup(iModelName);
      }
      return (
        <React.Suspense fallback={"Loading"}>
          <SampleUi iModelName={iModelName} />
        </React.Suspense>);
    };

    const group = sampleManifest.find((v) => v.groupName === this.state.activeSampleGroup)!;
    const sampleIndex = group.samples.findIndex((sample) => sample.name === activeSample.name);
    group.samples.splice(sampleIndex, 1, activeSample);
    this._onActiveSampleChange(group.groupName, activeSample.name);
  }

  public render() {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
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
            <SampleEditor files={files} onTranspiled={this.onSampleTranspiled} />
            <div style={{ height: "100%" }}>
              <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
                {this.state.sampleUI}
              </div>
            </div>
          </SplitScreen>
        </SplitScreen>
        <SampleGallery samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onActiveSampleChange} />
      </div>
    );
  }
}
