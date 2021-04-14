/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelSelector } from "common/IModelSelector/IModelSelector";
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
  public imodel: string;
  public type: string;
  public getReadme?: () => Promise<{ default: string }>;
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
    this.imodel = imodel && this.imodelList.includes(imodel) ? imodel : this.imodelList && this.imodelList.length ? this.imodelList[0] : "";
    this.type = result.spec.type || "";
    this.getFiles = result.spec.files;
    this.getReadme = result.spec.readme;

    updateURLParams(this.group, this.name, this.imodel);
  }

  public get imodelList() {
    return this._spec.customModelList || IModelSelector.defaultIModelList;
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
  const url = new URL(window.location.href);
  if (!url.pathname.includes("signin-callback")) {
    const params = new URLSearchParams({ group, sample });

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
};
