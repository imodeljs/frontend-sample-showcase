/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import ClassifierUI from "./ClassifierUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getClassifierSpec(): SampleSpec {
  return ({
    name: "classifier-sample",
    label: "Classifiers",
    image: "classifier-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClassifierApp.tsx", import: import("!!raw-loader!./ClassifierApp") },
      { name: "ClassifierUI.tsx", import: import("!!raw-loader!./ClassifierUI"), entry: true },
      { name: "ClassifierProperties.tsx", import: import("!!raw-loader!./ClassifierProperties") },
    ],
    modelList: [SampleIModels.MetroStation],
    sampleClass: ClassifierUI,
  });
}
