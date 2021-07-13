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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ClassifierApi"),
      import("!editor-file-loader!./ClassifierApp?entry=true"),
      import("!editor-file-loader!./ClassifierWidget"),
      import("!editor-file-loader!./ClassifierProperties"),
      import("!editor-file-loader!./Classifier.scss"),
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "ClassifierApp.tsx",
    description: "How to apply a #classifier to a #realitymodel. Also demonstrates how to adjust the display of #classifier, in this case a #spatial classifier",
  });
}
