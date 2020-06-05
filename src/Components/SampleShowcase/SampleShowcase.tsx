/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleGallery, SampleGalleryEntry } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "../../common/samples-common.scss";
import { sampleManifest, SampleSpecGroup } from "../../sampleManifest";
import { getViewportOnlySpec } from "../../frontend-samples/viewport-only-sample";
import { IModelSelector, SampleIModels } from "../IModelSelector/IModelSelector";

// cSpell:ignore imodels

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  customModelList?: string[];
  setup?: (iModelName: string) => Promise<React.ReactNode>;
  teardown?: () => void;
}

interface ShowcaseState {
  iModelName: string;
  activeSampleGroup: string;
  activeSampleSpec?: SampleSpec;
  sampleUI?: React.ReactNode;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
  private _samples = sampleManifest;

  constructor(props?: any, context?: any) {
    super(props, context);

    this.state = {
      iModelName: SampleIModels.RetailBuilding,
      activeSampleGroup: this._samples[0].groupName
    };
  }

  public componentDidMount() {
    const defaultSampleSpec = getViewportOnlySpec();
    // tslint:disable-next-line no-floating-promises
    this.setupNewSample(defaultSampleSpec.name);
  }

  private getActiveSampleGroup(): SampleSpecGroup {
    return this._samples.find((entry: SampleSpecGroup) => entry.groupName === this.state.activeSampleGroup)!;
  }

  private getSampleByName(name?: string): SampleSpec | undefined {
    if (!name)
      return undefined;

    const group = this.getActiveSampleGroup();

    return group.samples.find((entry: SampleSpec) => entry.name === name)!;
  }

  private getIModelList(sampleSpec: SampleSpec): string[] {
    const customModelList = sampleSpec.customModelList;
    return customModelList ? customModelList : IModelSelector.defaultModelList;
  }

  private async setupNewSample(name: string) {
    const newSampleSpec = this.getSampleByName(name);

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

  private _onActiveSampleChange = (name: string) => {
    const oldSample = this.state.activeSampleSpec;
    if (undefined !== oldSample && oldSample.teardown)
      oldSample.teardown();

    this.setupNewSample(name);
  }

  private _onActiveGroupChange = (name: string) => {
    const group = sampleManifest.find((e: SampleSpecGroup) => e.groupName === name);

    if (undefined === group)
      return;

    this.setState({ activeSampleGroup: group.groupName }, () => this._onActiveSampleChange(group.samples[0].name));
  }

  private getGalleryList(): SampleGalleryEntry[] {
    const group = this.getActiveSampleGroup();

    return group.samples.map((val: SampleSpec) => ({ image: val.image, label: val.label, value: val.name }));
  }

  private onIModelChange = (iModelName: string) => {
    this.setState({ iModelName }, () => this._onActiveSampleChange(this.state.activeSampleSpec!.name));
  }

  public render() {
    const activeSampleName = this.state.activeSampleSpec ? this.state.activeSampleSpec.name : "";
    const modelList = this.state.activeSampleSpec ? this.getIModelList(this.state.activeSampleSpec) : null;

    return (
      <>
        <div className="showcase">
          <div id="sample-container" className="sample-content">
            {this.state.sampleUI}
          </div>
          <SampleGallery entries={this.getGalleryList()} group={this.state.activeSampleGroup} selected={activeSampleName} onChange={this._onActiveSampleChange} onGroupChange={this._onActiveGroupChange} />
          {modelList && 1 < modelList.length &&
            <div className="model-selector">
              <IModelSelector iModelNames={modelList} iModelName={this.state.iModelName} onIModelChange={this.onIModelChange} />
            </div>
          }
        </div>
      </>
    );
  }
}
