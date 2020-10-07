/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleGallery } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "common/samples-common.scss";
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector, SampleIModels } from "../IModelSelector/IModelSelector";
import { ConnectedSampleEditor } from "../SampleEditor/SampleEditor";
import { editorCommonActionContext, IInternalFile, SplitScreen } from "@bentley/monaco-editor/editor";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import SampleApp from "common/SampleApp";

// cSpell:ignore imodels

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  files: IInternalFile[];
  customModelList?: string[];
  setup: (iModelName: string, iModelSelector: React.ReactNode) => Promise<React.ReactNode>;
  teardown?: () => void;
}

interface ShowcaseState {
  iModelName: string;
  activeSampleGroup: string;
  activeSampleName: string;
  sampleUI?: React.ReactNode;
  showEditor: boolean;
  showGallery: boolean;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
  public static contextType = editorCommonActionContext;
  public context!: React.ContextType<typeof editorCommonActionContext>;
  private _samples = sampleManifest;
  private _prevSampleSetup?: any;
  private _prevSampleTeardown?: any;

  constructor(props?: any, context?: any) {
    super(props, context);

    const names = this.getNamesFromURLParams();

    this.state = {
      iModelName: names.imodel,
      activeSampleGroup: names.group,
      activeSampleName: names.sample,
      showEditor: true,
      showGallery: true,
    };

  }

  private getNamesFromURLParams(): { group: string, sample: string, imodel: string } {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGroupName = urlParams.get("group");
    const urlSampleName = urlParams.get("sample");
    const iModelName = urlParams.get("imodel");

    let namesAreValid = false;
    let group = "";
    let sample = "";

    if (urlGroupName && urlSampleName) {
      namesAreValid = undefined !== this.getSampleByName(urlGroupName, urlSampleName);
      group = urlGroupName;
      sample = urlSampleName;
    }

    let imodel = "";

    if (iModelName) {
      const sampleImodels: string[] = Object.values(SampleIModels);
      if (sampleImodels.includes(iModelName)) {
        imodel = iModelName;
      } else {
        imodel = IModelSelector.defaultIModel;
      }
    } else {
      imodel = IModelSelector.defaultIModel;
    }

    if (!namesAreValid) {
      group = this._samples[0].groupName;
      sample = this._samples[0].samples[0].name;
    }

    return { group, sample, imodel };
  }

  private updateURLParams() {
    const params = new URLSearchParams();
    params.append("group", this.state.activeSampleGroup);
    params.append("sample", this.state.activeSampleName);

    if (this.state.iModelName) {
      params.append("imodel", this.state.iModelName);
    }

    // Detect if editor was enabled in URL params as a semi-backdoor, this
    // bypasses the ld feature flag
    const editorEnabled = new URLSearchParams(window.location.search).get("editor");
    if (editorEnabled) params.append("editor", editorEnabled);

    window.history.replaceState(null, "", `?${params.toString()}`);

    // Send to parent if within an iframe.
    if (window.self !== window.top) {
      window.parent.postMessage(`?${params.toString()}`, "*");
    }
  }

  public componentDidMount() {
    this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName);

    document.documentElement.setAttribute("data-theme", "dark");
  }

  public componentDidUpdate(_prevProps: {}, prevState: ShowcaseState) {
    if (prevState.activeSampleGroup !== this.state.activeSampleGroup ||
      prevState.activeSampleName !== this.state.activeSampleName ||
      prevState.iModelName !== this.state.iModelName) {
      this.updateURLParams();
    }

    if (prevState.iModelName !== this.state.iModelName)
      this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName);
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
          <IModelSelector iModelNames={iModelList} iModelName={iModelName} onIModelChange={this._onIModelChange} />
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
      const iModelSelector = this.getIModelSelector(iModelName, iModelList);
      sampleUI = await newSampleSpec.setup(iModelName, iModelSelector);
    }

    this.setState({ activeSampleGroup: groupName, activeSampleName: sampleName, sampleUI, iModelName });
  }

  private _onGalleryChanged = (groupName: string, sampleName: string) => {
    if (this._prevSampleSetup) {
      if (window.confirm("Changes made to the code will not be saved!")) {
        const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
        activeSample.setup = this._prevSampleSetup;
        activeSample.teardown = this._prevSampleTeardown;
        this._prevSampleSetup = undefined;
        this._prevSampleTeardown = undefined;
        this._onActiveSampleChange(groupName, sampleName);
      }
    } else {
      this._onActiveSampleChange(groupName, sampleName);
    }
  }

  private _onActiveSampleChange = (groupName: string, sampleName: string) => {
    const oldSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    if (undefined !== oldSample && oldSample.teardown)
      oldSample.teardown();

    this.setupNewSample(groupName, sampleName);
  }

  private _onIModelChange = (iModelName: string) => {
    this.setState({ iModelName });
  }

  private _onEditorButtonClick = () => {
    this.setState((prevState) => ({ showEditor: !prevState.showEditor }));
  }

  private _onSampleTranspiled = async (blob: string) => {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
    const sampleUi = (await import( /* webpackIgnore: true */ blob)).default as typeof SampleApp;

    if (!this._prevSampleSetup) {
      this._prevSampleSetup = activeSample.setup;
    }
    if (!this._prevSampleTeardown) {
      this._prevSampleTeardown = activeSample.teardown;
    }

    activeSample.setup = async (iModelName: string, iModelSelector: React.ReactNode) => {
      try {
        return sampleUi.setup(iModelName, iModelSelector);
      } catch (err) {
        return (
          <DisplayError error={err} />
        );
      }
    };

    activeSample.teardown = sampleUi.teardown || this._prevSampleTeardown;

    const group = sampleManifest.find((v) => v.groupName === this.state.activeSampleGroup)!;
    const sampleIndex = group.samples.findIndex((sample) => sample.name === activeSample.name);
    group.samples.splice(sampleIndex, 1, activeSample);
    this._onActiveSampleChange(group.groupName, activeSample.name);
  }

  private _onEditorSizeChange = (size: number) => {
    if (size <= 200 && this.state.showEditor) {
      this.setState({ showEditor: false });
    }
  }

  private _onSampleGallerySizeChange = (size: number) => {
    if (size <= 100 && this.state.showGallery) {
      this.setState({ showGallery: false });
    }
  }

  public render() {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    const files = activeSample ? activeSample.files : undefined;

    return (
      <div className="showcase">
        <SplitScreen primary="second" resizerStyle={this.state.showGallery ? undefined : { display: "none" }} minSize={this.state.showGallery ? 100 : 150} size={this.state.showGallery ? "20%" : 0} split="vertical" defaultSize="20%" pane1Style={{ minWidth: "75%" }} pane2Style={this.state.showGallery ? { maxWidth: "25%" } : { width: 0 }} onChange={this._onSampleGallerySizeChange}>
          <SplitScreen style={{ position: "relative" }} resizerStyle={this.state.showEditor ? undefined : { display: "none" }} minSize={this.state.showEditor ? 190 : 210} size={this.state.showEditor ? 500 : 0} maxSize={1450} pane1Style={this.state.showEditor ? { maxWidth: "80%" } : { width: 0 }} onChange={this._onEditorSizeChange}>
            <ConnectedSampleEditor files={files} onTranspiled={this._onSampleTranspiled} onCloseClick={this._onEditorButtonClick} />
            <div style={{ height: "100%" }}>
              <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
                {!this.state.showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={this._onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
                <ErrorBoundary>
                  {this.state.sampleUI || null}
                </ErrorBoundary>
              </div>
              {this.state.showGallery ? undefined : <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={() => this.setState({ showGallery: true })}><span className="icon icon-chevron-left"></span></Button>}
            </div>
          </SplitScreen>
          <SampleGallery samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onGalleryChanged} onCollapse={() => this.setState({ showGallery: false })} />
        </SplitScreen>
      </div>
    );
  }
}
