/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ClassifierApp from "./ClassifierApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getClassifierSpec(): SampleSpec {
  return ({
    name: "classifier-sample",
    label: "Classifiers",
    image: "classifier-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClassifierApp.tsx", import: import("!!raw-loader!./ClassifierApp"), entry: true },
      { name: "ClassifierUI.tsx", import: import("!!raw-loader!./ClassifierUI") },
      { name: "ClassifierProperties.tsx", import: import("!!raw-loader!./ClassifierProperties") },
    ],
    customModelList: [SampleIModels.MetroStation],
    setup: ClassifierApp.setup.bind(ClassifierApp),
  });
}
