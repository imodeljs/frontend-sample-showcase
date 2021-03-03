/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ClassifierUI from "./ClassifierUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getClassifierSpec(): SampleSpec {
  return ({
    name: "classifier-sample",
    label: "Classifiers",
    image: "classifier-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClassifierUI.tsx", import: import("!!raw-loader!./ClassifierUI"), entry: true },
      { name: "ClassifierApp.tsx", import: import("!!raw-loader!./ClassifierApp") },
      { name: "ClassifierProperties.tsx", import: import("!!raw-loader!./ClassifierProperties") },
    ],
    customModelList: [SampleIModels.MetroStation],
    sampleClass: ClassifierUI,
  });
}
