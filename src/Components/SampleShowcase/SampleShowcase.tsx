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
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MovePointTool } from "common/GeometryCommon/InteractivePointMarker";

// cSpell:ignore imodels

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  readme?: IInternalFile;
  files: IInternalFile[];
  customModelList?: string[];
  setup: (iModelName: string, iModelSelector: React.ReactNode, iModelName2?: string) => Promise<React.ReactNode>;
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
  private static _sampleNamespace: I18NNamespace;
  public static contextType = editorCommonActionContext;
  public context!: React.ContextType<typeof editorCommonActionContext>;
  private _samples = sampleManifest;
  private _prevSampleSetup?: any;
  private _prevSampleTeardown?: any;
  private _wantScroll = false;
  private _galleryRef = React.createRef<SampleGallery>();

  constructor(props?: any) {
    super(props);

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

  private updateURLParams(group: string, sample: string, imodel?: string) {
    const params = new URLSearchParams();
    params.append("group", group);
    params.append("sample", sample);

    if (imodel) {
      params.append("imodel", imodel);
    }

    // Detect if editor was enabled in URL params as a semi-backdoor, this
    // bypasses the ld feature flag
    const editorEnabled = new URLSearchParams(window.location.search).get("editor");
    if (editorEnabled) params.append("editor", editorEnabled);

    window.history.pushState(null, "", `?${params.toString()}`);

    // Send to parent if within an iframe.
    if (window.self !== window.top) {
      window.parent.postMessage(`?${params.toString()}`, "*");
    }
  }

  public componentWillUnmount() {
    IModelApp.i18n.unregisterNamespace("sample-showcase-i18n-namespace");
    IModelApp.tools.unRegister(MovePointTool.toolId);
  }

  public componentDidMount() {
    this._onActiveSampleChange("", "");

    document.documentElement.setAttribute("data-theme", "dark");

    window.onpopstate = (_ev: PopStateEvent) => {
      const names = this.getNamesFromURLParams();
      this.setState({ iModelName: names.imodel, activeSampleGroup: names.group, activeSampleName: names.sample });
    };

    SampleShowcase._sampleNamespace = IModelApp.i18n.registerNamespace("sample-showcase-i18n-namespace");
    MovePointTool.register(SampleShowcase._sampleNamespace);
  }

  public componentDidUpdate(_prevProps: {}, prevState: ShowcaseState) {

    if (prevState.activeSampleGroup !== this.state.activeSampleGroup ||
      prevState.activeSampleName !== this.state.activeSampleName ||
      prevState.iModelName !== this.state.iModelName) {

      if (this._wantScroll && this._galleryRef.current) {
        this._galleryRef.current.scrollToActiveSample();
        this._wantScroll = false;
      }

      this._onActiveSampleChange(prevState.activeSampleGroup, prevState.activeSampleName);
    }
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

    return undefined;
  }

  private async setupNewSample() {

    const newSampleSpec = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    if (undefined === newSampleSpec) {
      this.setState({ activeSampleGroup: "", activeSampleName: "", iModelName: "" });
      return;
    }

    let sampleUI: React.ReactNode;

    if (newSampleSpec.setup) {
      const iModelList = this.getIModelList(newSampleSpec);
      const iModelSelector = this.getIModelSelector(this.state.iModelName, iModelList);
      sampleUI = await newSampleSpec.setup(this.state.iModelName, iModelSelector);
    }

    this.setState({ sampleUI });
  }

  private _updateNames = (names: { group: string, sample: string, imodel?: string }) => {
    if (this._prevSampleSetup) {
      if (!window.confirm("Changes made to the code will not be saved!")) {
        return;
      }

      const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
      activeSample.setup = this._prevSampleSetup;
      activeSample.teardown = this._prevSampleTeardown;
      this._prevSampleSetup = undefined;
      this._prevSampleTeardown = undefined;
    }

    let iModelName = names.imodel;
    if (names.group !== this.state.activeSampleGroup || names.sample !== this.state.activeSampleName) {
      const newSampleSpec = this.getSampleByName(names.group, names.sample);

      if (newSampleSpec) {
        const iModelList = this.getIModelList(newSampleSpec);
        iModelName = iModelList[0];
      }
    }

    this.updateURLParams(names.group, names.sample, iModelName);
    this.setState({ activeSampleGroup: names.group, activeSampleName: names.sample, iModelName: iModelName ? iModelName : "" });
  }

  private _onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {
    this._wantScroll = wantScroll;
    this._updateNames({ group: groupName, sample: sampleName })
  }

  private _onActiveSampleChange = (prevGroupName: string, prevSampleName: string) => {
    const oldSample = this.getSampleByName(prevGroupName, prevSampleName);
    if (undefined !== oldSample && oldSample.teardown)
      oldSample.teardown();

    this.setupNewSample();
  }

  private _onIModelChange = (iModelName: string) => {
    this._updateNames({ group: this.state.activeSampleGroup, sample: this.state.activeSampleName, imodel: iModelName })
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
    const readme = activeSample ? activeSample.readme : undefined;
    const files = activeSample ? activeSample.files : undefined;

    return (
      <div className="showcase">
        <SplitScreen primary="second" resizerStyle={this.state.showGallery ? undefined : { display: "none" }} minSize={this.state.showGallery ? 100 : 150} size={this.state.showGallery ? "20%" : 0} split="vertical" defaultSize="20%" pane1Style={{ minWidth: "75%" }} pane2Style={this.state.showGallery ? { maxWidth: "25%" } : { width: 0 }} onChange={this._onSampleGallerySizeChange}>
          <SplitScreen style={{ position: "relative" }} resizerStyle={this.state.showEditor ? undefined : { display: "none" }} minSize={this.state.showEditor ? 190 : 210} size={this.state.showEditor ? 500 : 0} maxSize={1450} pane1Style={this.state.showEditor ? { maxWidth: "80%" } : { width: 0 }} onChange={this._onEditorSizeChange}>
            <ConnectedSampleEditor files={files} readme={readme} onTranspiled={this._onSampleTranspiled} onCloseClick={this._onEditorButtonClick} onSampleClicked={this._onGalleryCardClicked} />
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
          <SampleGallery ref={this._galleryRef} samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onGalleryCardClicked} onCollapse={() => this.setState({ showGallery: false })} />
        </SplitScreen>
      </div>
    );
  }
}
