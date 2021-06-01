/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";

export function getClassifierSpec(): SampleSpec {
  return ({
    name: "classifier-sample",
    label: "Classifiers",
    image: "classifier-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "ClassifierApi.ts", import: import("-!raw-loader!./ClassifierApi") },
      { name: "ClassifierApp.tsx", import: import("-!raw-loader!./ClassifierApp"), entry: true },
      { name: "ClassifierWidget.tsx", import: import("-!raw-loader!./ClassifierWidget") },
      { name: "ClassifierProperties.tsx", import: import("-!raw-loader!./ClassifierProperties") },
      { name: "Classifier.scss", import: import("-!raw-loader!./Classifier.scss") },
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "ClassifierApp.tsx",
  });
}
