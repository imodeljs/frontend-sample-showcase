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
  activeSampleSpec?: SampleSpec;
  sampleUI?: React.ReactNode;
  showEditor: boolean;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
  private _samples = sampleManifest;

  constructor(props?: any, context?: any) {
    super(props, context);

    this.state = {
      iModelName: IModelSelector.defaultIModel,
      activeSampleGroup: this._samples[0].groupName,
      showEditor: false,
    };
    this.onEditorButtonClick = this.onEditorButtonClick.bind(this);
  }

  public componentDidMount() {
    const defaultGroup = sampleManifest[0].groupName;
    const defaultSample = sampleManifest[0].samples[0].name;
    // tslint:disable-next-line no-floating-promises
    this._onActiveSampleChange(defaultGroup, defaultSample);

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

  private async setupNewSample(newSampleSpec?: SampleSpec) {
    if (undefined === newSampleSpec) {
      this.setState({ activeSampleSpec: newSampleSpec });
      return;
    }

    let sampleUI: React.ReactNode;
    let iModelName = this.state.iModelName;

    if (newSampleSpec && newSampleSpec.setup) {

      if (newSampleSpec !== this.state.activeSampleSpec) {
        iModelName = this.getIModelList(newSampleSpec)[0];
      }

      sampleUI = await newSampleSpec.setup(iModelName);
    }

    this.setState({ activeSampleSpec: newSampleSpec, sampleUI, iModelName });
  }

  private _switchActiveSample(newSample?: SampleSpec) {
    const oldSample = this.state.activeSampleSpec;
    if (undefined !== oldSample && oldSample.teardown)
      oldSample.teardown();

    // tslint:disable-next-line no-floating-promises
    this.setupNewSample(newSample);
  }

  private _onActiveSampleChange = (groupName: string, sampleName: string) => {
    const newSampleSpec = this.getSampleByName(groupName, sampleName);
    this._switchActiveSample(newSampleSpec);
  }

  private onIModelChange = (iModelName: string) => {
    this.setState({ iModelName }, () => this._switchActiveSample(this.state.activeSampleSpec!));
  }

  private onEditorButtonClick() {
    this.setState((prevState) => ({ showEditor: !prevState.showEditor }));
  }

  public render() {
    const activeSampleName = this.state.activeSampleSpec ? this.state.activeSampleSpec.name : "";
    const modelList = this.state.activeSampleSpec ? this.getIModelList(this.state.activeSampleSpec) : null;
    const files = this.state.activeSampleSpec ? this.state.activeSampleSpec.files : undefined;

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
        <SampleGallery samples={this._samples} group={this.state.activeSampleGroup} selected={activeSampleName} onChange={this._onActiveSampleChange} />
      </div>
    );
  }
}
