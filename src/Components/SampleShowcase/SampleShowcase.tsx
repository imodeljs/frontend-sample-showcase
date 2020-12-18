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
  dragging: boolean;
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
      dragging: false,
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

  public componentWillUnmount() {
    IModelApp.i18n.unregisterNamespace("sample-showcase-i18n-namespace");
    IModelApp.tools.unRegister(MovePointTool.toolId);
  }

  public componentDidMount() {
    this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName);

    document.documentElement.setAttribute("data-theme", "dark");

    SampleShowcase._sampleNamespace = IModelApp.i18n.registerNamespace("sample-showcase-i18n-namespace");
    MovePointTool.register(SampleShowcase._sampleNamespace);
  }

  public componentDidUpdate(_prevProps: {}, prevState: ShowcaseState) {
    if (prevState.activeSampleGroup !== this.state.activeSampleGroup ||
      prevState.activeSampleName !== this.state.activeSampleName ||
      prevState.iModelName !== this.state.iModelName) {

      this.updateURLParams();

      if (this._wantScroll && this._galleryRef.current) {
        this._galleryRef.current.scrollToActiveSample();
        this._wantScroll = false;
      }

      if (prevState.iModelName !== this.state.iModelName)
        this._onActiveSampleChange(this.state.activeSampleGroup, this.state.activeSampleName);
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

  private _onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {

    this._wantScroll = wantScroll;

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

  private _onDragStarted = () => {
    this.setState({ dragging: true });
  }

  private _onDragFinished = () => {
    this.setState({ dragging: false });
  }

  public render() {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    const readme = activeSample ? activeSample.readme : undefined;
    const files = activeSample ? activeSample.files : undefined;

    const showEditor = this.state.showEditor;
    const showGallery = this.state.showGallery;

    /* To hide the side panels, we are setting their width to zero.  It would be better to translate them
       off the screen but I can't make that work with the SplitPanel.  One negative side effect is that
       the contents of the panels resize during the hide/show transition.  To prevent the user from seeing
       the resize, we set the opacity to zero.

       When closing, set the opacity to 0 immediately.  When opening, delay until the panel is fully open. */
    const closeTransition = this.state.dragging ? {} : { transition: "width .2s ease" };
    const openTransition = this.state.dragging ? {} : { transition: "width .2s ease, opacity .1s .2s" };
    const closedPanelStyle = { ...closeTransition, width: "0", opacity: "0" };

    const openEditorPanelStyle = { ...openTransition, maxWidth: "80%" };
    const editorPanelStyle = showEditor ? openEditorPanelStyle : closedPanelStyle;

    const openGalleryPanelStyle = { ...openTransition, maxWidth: "25%" };
    const galleryPanelStyle = showGallery ? openGalleryPanelStyle : closedPanelStyle;

    return (
      <div className="showcase">
        <SplitScreen primary="second" resizerStyle={showGallery ? undefined : { display: "none" }} minSize={showGallery ? 100 : 150} size={showGallery ? "20%" : 0} split="vertical" defaultSize="20%" pane1Style={{ minWidth: "75%" }} pane2Style={galleryPanelStyle} onChange={this._onSampleGallerySizeChange} onDragStarted={this._onDragStarted} onDragEnd={this._onDragFinished}>
          <SplitScreen style={{ position: "relative" }} resizerStyle={showEditor ? undefined : { display: "none" }} minSize={showEditor ? 190 : 210} size={showEditor ? 500 : 0} maxSize={1450} pane1Style={editorPanelStyle} onChange={this._onEditorSizeChange} onDragStarted={this._onDragStarted} onDragEnd={this._onDragFinished}>
            <ConnectedSampleEditor files={files} readme={readme} onTranspiled={this._onSampleTranspiled} onCloseClick={this._onEditorButtonClick} onSampleClicked={this._onGalleryCardClicked} />
            <div style={{ height: "100%" }}>
              {!showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={this._onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
              {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={this._onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
              <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
                <ErrorBoundary>
                  {this.state.sampleUI || null}
                </ErrorBoundary>
              </div>
              {showGallery ? undefined : <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={() => this.setState({ showGallery: true })}><span className="icon icon-chevron-left"></span></Button>}
              {showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={() => this.setState({ showGallery: false })}><span className="icon icon-chevron-right"></span></Button>}
            </div>
          </SplitScreen>
          <SampleGallery ref={this._galleryRef} samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onGalleryCardClicked} onCollapse={() => this.setState({ showGallery: false })} />
        </SplitScreen>
      </div>
    );
  }
}
