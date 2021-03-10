/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { SampleGallery } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "common/samples-common.scss";
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector } from "common/IModelSelector/IModelSelector";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MovePointTool } from "common/Geometry/InteractivePointMarker";
import { Pane, SplitScreen } from "@bentley/monaco-editor";
import { SampleSpec } from "SampleSpec";
import SampleEditorContext from "Components/SampleEditor/SampleEditorContext";
// cSpell:ignore imodels

interface ShowcaseState {
  iModelName: string;
  activeSampleGroup: string;
  activeSampleName: string;
  sampleUI?: React.ReactNode;
  showEditor: boolean;
  showGallery: boolean;
  dragging: boolean;
}


export interface SampleProps extends React.Attributes {
  iModelName?: string;
  iModelSelector?: React.ReactNode;
}


/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
  private static _sampleNamespace: I18NNamespace;
  private _samples = sampleManifest;
  private _prevSampleClass: any;
  private _wantScroll = false;
  private _galleryRef = React.createRef<SampleGallery>();
  private _showcaseRef = React.createRef<HTMLDivElement>();
  private _sizes: string[] = ["20%", "1", "20%"];

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

    if (!namesAreValid) {
      group = this._samples[0].groupName;
      sample = this._samples[0].samples[0].name;
    }

    let imodel = iModelName;
    const spec = this.getSampleByName(group, sample)!;
    const iModelList = this.getIModelList(spec);

    if (0 === iModelList.length) {
      imodel = "";
    } else if (!imodel || !iModelList.includes(imodel)) {
      imodel = iModelList[0];
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
    this._onActiveSampleChange();

    document.documentElement.setAttribute("data-theme", "dark");

    window.onpopstate = (_ev: PopStateEvent) => {
      const names = this.getNamesFromURLParams();
      this._wantScroll = true;
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
        this._wantScroll = false;
        this._galleryRef.current.scrollToActiveSample();
      }

      this._onActiveSampleChange();
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

    if (newSampleSpec.sampleClass) {
      const iModelList = this.getIModelList(newSampleSpec);
      const iModelSelector = this.getIModelSelector(this.state.iModelName, iModelList);
      const props: SampleProps = {
        iModelName: this.state.iModelName,
        iModelSelector,
      }

      try {
        sampleUI = sampleUI = React.createElement(newSampleSpec.sampleClass, props);
      } catch (err) {
        sampleUI = <DisplayError error={err} />
      }
    }

    this.setState({ sampleUI });
  }

  private _updateNames = (names: { group: string, sample: string, imodel?: string }) => {
    if (this._prevSampleClass) {
      if (!window.confirm("Changes made to the code will not be saved!")) {
        return;
      }

      const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
      activeSample.sampleClass = this._prevSampleClass;
      this._prevSampleClass = undefined;
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

  private _onActiveSampleChange = () => {
    this.setupNewSample();
  }

  private _onIModelChange = (iModelName: string) => {
    this._updateNames({ group: this.state.activeSampleGroup, sample: this.state.activeSampleName, imodel: iModelName })
  }

  private _onEditorButtonClick = () => {
    this.setState((prevState) => ({ showEditor: !prevState.showEditor }));
  }

  private _onGalleryButtonClick = () => {
    this.setState((prevState) => ({ showGallery: !prevState.showGallery }));
  }

  private _onSampleTranspiled = async (blob: string) => {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName)!;
    const sampleUi = (await import( /* webpackIgnore: true */ blob)).default as typeof React.Component;

    if (!this._prevSampleClass) {
      this._prevSampleClass = activeSample.sampleClass;
    }

    activeSample.sampleClass = sampleUi;

    const group = sampleManifest.find((v) => v.groupName === this.state.activeSampleGroup)!;
    const sampleIndex = group.samples.findIndex((sample) => sample.name === activeSample.name);
    group.samples.splice(sampleIndex, 1, activeSample);
    this._onActiveSampleChange();
  }

  private _onEditorSizeChange = (size: number) => {
    if (this.state.dragging) {
      if (size < 200) {
        this.setState({ showEditor: false });
      } else {
        this.setState({ showEditor: true });
      }
    }
  }

  private _onSampleGallerySizeChange = (size: number) => {
    if (this.state.dragging) {
      if (size < 200) {
        this.setState({ showGallery: false });
      } else {
        this.setState({ showGallery: true });
      }
    }
  }

  private _onDragStarted = () => {
    this.setState({ dragging: true });
  }

  private _onDragFinished = (sizes: string[]) => {
    this._sizes = sizes;
    this.setState({ dragging: false });
  }

  private calculateMinSize(containerSize: number, sizeStr: string = "0") {
    const tokens = sizeStr.match(/([0-9]+)([px|%]*)/)!;
    const value = parseInt(tokens[1], 10);
    return +(containerSize * value / 100).toFixed(2);
  }

  public render() {
    const activeSample = this.getSampleByName(this.state.activeSampleGroup, this.state.activeSampleName);
    const readme = activeSample ? activeSample.readme : undefined;
    const files = activeSample ? activeSample.files : undefined;

    const { showEditor, showGallery, dragging } = this.state;

    const editorSize = !dragging && !showEditor ? "0%" : this._sizes[0];
    const gallerySize = !dragging && !showGallery ? "0%" : this._sizes[2];

    const width = this._showcaseRef.current?.getBoundingClientRect().width;
    const editorMinSize = !!width && !dragging ? this.calculateMinSize(width, this._sizes[0]) : undefined;
    const galleryMinSize = !!width && !dragging ? this.calculateMinSize(width, this._sizes[2]) : undefined;

    const gallaryClassName = this.state.dragging ? "gallery-pane dragging" : "gallery-pane";
    const editorClassName = this.state.dragging ? "editor-pane dragging" : "editor-pane";


    return (
      <div className="showcase" ref={this._showcaseRef}>
        <SplitScreen split="vertical" onResizeStart={this._onDragStarted} onResizeEnd={this._onDragFinished}>
          <Pane className={editorClassName} snapSize={"200px"} defaultSize={this._sizes[0]} size={editorSize} onChange={this._onEditorSizeChange} disabled={!showEditor}>
            <SampleEditorContext minSize={editorMinSize} files={files} readme={readme} onTranspiled={this._onSampleTranspiled} onCloseClick={this._onEditorButtonClick} onSampleClicked={this._onGalleryCardClicked} />
          </Pane>
          <Pane className="preview" minSize={"500px"}>
            {!showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={this._onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
            {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={this._onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
            <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
              <ErrorBoundary>
                {this.state.sampleUI || null}
              </ErrorBoundary>
            </div>
            {!showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={this._onGalleryButtonClick}><span className="icon icon-chevron-left"></span></Button>}
            {showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={this._onGalleryButtonClick}><span className="icon icon-chevron-right"></span></Button>}
          </Pane>
          <Pane className={gallaryClassName} snapSize={"200px"} size={gallerySize} maxSize={"20%"} defaultSize={this._sizes[2]} onChange={this._onSampleGallerySizeChange} disabled={!showGallery}>
            <SampleGallery minSize={galleryMinSize} ref={this._galleryRef} samples={this._samples} group={this.state.activeSampleGroup} selected={this.state.activeSampleName} onChange={this._onGalleryCardClicked} />
          </Pane>
        </SplitScreen>
      </div>
    );
  }
}
