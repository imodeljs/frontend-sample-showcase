/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Annotation } from "@bentley/monaco-editor";
import { defaultIModel, defaultIModelList } from "@itwin/sandbox/constants";
import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { sampleManifest } from "sampleManifest";
import { SampleSpec, SampleSpecFile, Walkthrough } from "SampleSpec";

interface SpecResolveResult {
  spec: SampleSpec;
  name: string;
  group: string;
}

export class ActiveSample {
  private _spec: SampleSpec;
  private _walkthrough?: () => Walkthrough;
  public group: string;
  public name: string;
  public imodel: SampleIModels;
  public getReadme?: () => Promise<{ default: string }>;
  public getFiles?: () => Promise<SampleSpecFile>[];
  public type: string;
  public galleryVisible: boolean = true;

  constructor(group?: string | null, name?: string | null, imodel?: SampleIModels | null) {
    const params = new URLSearchParams(window.location.search);
    if (!group && !name) {
      group = params.get("group");
      name = params.get("sample");
      imodel = params.get("imodel") as SampleIModels;
    }
    this.galleryVisible = params.get("gallery") !== "false";
    const result = this.resolveSpec(group, name);
    this.group = result.group;
    this.name = result.name;
    this._spec = result.spec;
    this.imodel = imodel && this.imodelList.includes(imodel) ? imodel : this.imodelList && this.imodelList.length ? this.imodelList[0] : defaultIModel;
    this.getFiles = result.spec.files;
    this.getReadme = result.spec.readme;
    this._walkthrough = result.spec.walkthrough;
    this.type = result.spec.type || "";

    updateURLParams(this.group, this.name, this.imodel);
  }

  public get imodelList() {
    return this._spec.iModelList || defaultIModelList;
  }

  private resolveSpec(group?: string | null, name?: string | null): SpecResolveResult {
    const foundGroup = (group ? sampleManifest.find((v) => v.groupName === group) : sampleManifest.find((v) => v.samples.some((sample) => sample.name === name))) || sampleManifest[0];
    const foundSpec = foundGroup.samples.find((v) => v.name === name) || foundGroup.samples[0];
    return {
      spec: foundSpec,
      name: foundSpec.name,
      group: foundGroup.groupName,
    };
  }

  public getWalkthrough = async () => {
    if (this._walkthrough) {
      const walkthrough = this._walkthrough();
      const annotations = (await walkthrough.annotations).default;
      const initialStep = this.createInitialStep(this._spec.label, walkthrough.prerequisites);

      return [initialStep, ...annotations];
    }
    return undefined;
  };

  private createInitialStep = (name: string, prerequisites?: SampleSpec[]) => {
    const markdown = [
      "**Getting Started**  ",
      `This panel will give you a guided tour of the ${name.split("-").map((word) => word[0].toUpperCase() + word.substr(1)).join(" ")} code sample.`,
      "",
      "Please use the → button below to start the tour. Or you can browse through and jump directly to any step using the control above. During the tour, the ◯ button will recenter the code editor.",
      "",
    ];

    if (prerequisites) {
      markdown.push("**Prerequisites**  ");
      markdown.push("This walkthrough may cover more advanced concepts. Below is a list of samples that will introduce concepts that you should be familiar with and will not be discussed in this sample.");
      markdown.push("");
      prerequisites.forEach((sample) => {
        markdown.push(`- [${sample.label.split("-").map((word) => word[0].toUpperCase() + word.substr(1)).join(" ")}](/?sample=${sample.name})`);
      });
    }

    const initialStep: Annotation = {
      index: "0",
      title: "Welcome",
      markdown: markdown.join("\n"),
    };

    return initialStep;
  };
}

const updateURLParams = (group: string, sample: string, imodel?: string) => {
  const url = new URL(window.location.href);
  if (!url.pathname.includes("signin-callback")) {
    const params = new URLSearchParams({ group, sample });

    if (imodel) {
      params.append("imodel", imodel);
    }

    const currentParams = new URLSearchParams(window.location.search);

    // Replace these three params
    currentParams.delete("group");
    currentParams.delete("sample");
    currentParams.delete("imodel");

    // Keep other params
    currentParams.forEach((value, key) => {
      params.append(key, value);
    });

    window.history.pushState(null, "", `?${params.toString()}`);

    // Send to parent if within an iframe.
    if (window.self !== window.top) {
      window.parent.postMessage(`?${params.toString()}`, "*");
    }
  }
};
