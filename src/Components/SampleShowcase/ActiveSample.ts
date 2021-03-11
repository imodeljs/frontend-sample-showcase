/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { defaultIModel, defaultIModelList } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";
import React from "react";
import { sampleManifest } from "sampleManifest";
import { SampleSpec, SampleSpecFile } from "SampleSpec";

interface SpecResolveResult {
  spec: SampleSpec;
  name: string;
  group: string;
}

export class ActiveSample {
  private _spec: SampleSpec;
  public group: string;
  public name: string;
  public sampleClass: typeof React.Component;
  public imodel: SampleIModels;
  public getReadme?: () => SampleSpecFile;
  public getFiles?: () => SampleSpecFile[];

  constructor(group?: string | null, name?: string | null, imodel?: string | null) {
    if (!group || !name) {
      const params = new URLSearchParams(window.location.search);
      group = params.get("group");
      name = params.get("sample");
      imodel = params.get("imodel");
    }
    const result = this.resolveSpec(group, name);
    this.group = result.group;
    this.name = result.name;
    this._spec = result.spec;
    this.sampleClass = result.spec.sampleClass;
    this.imodel = imodel && this.imodelList.includes(imodel as SampleIModels) ? imodel as SampleIModels : this.imodelList && this.imodelList.length ? this.imodelList[0] : defaultIModel;
    this.getFiles = () => result.spec.files;
    this.getReadme = result.spec.readme ? (() => result.spec.readme!) : undefined;

    updateURLParams(this.group, this.name, this.imodel);
  }

  public get imodelList() {
    return this._spec.modelList || defaultIModelList;
  }

  private resolveSpec(group?: string | null, name?: string | null): SpecResolveResult {
    const foundGroup = sampleManifest.find((v) => v.groupName === group) || sampleManifest.find((v) => v.groupName === sampleManifest[0].groupName);
    const foundSpec = foundGroup?.samples.find((v) => v.name === name) || foundGroup?.samples.find((v) => v.name === sampleManifest[0].samples[0].name);
    return {
      spec: foundSpec!,
      name: foundSpec!.name,
      group: foundGroup!.groupName,
    };
  }
}

const updateURLParams = (group: string, sample: string, imodel?: string) => {
  const params = new URLSearchParams({ group, sample });
  // params.append("group", group);
  // params.append("sample", sample);

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
