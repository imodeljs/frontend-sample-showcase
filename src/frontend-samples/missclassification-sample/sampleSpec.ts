/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getMisclassificationSpec(): SampleSpec {
  return ({
    name: "misclassification-sample",
    label: "Misclassification",
    image: "classification.png",
    description: "Uses the design #validation api to get and visualize #misclassified elements from a #misclassification test ran in the #machine #learning api.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./MisclassificationApi"),
      import("!editor-file-loader!./MisclassificationApp.tsx?entry=true"),
      import("!editor-file-loader!./MisclassificationTableWidget.tsx"),
      import("!editor-file-loader!./MisclassificationsJson.ts"),
    ],
    iModelList: [SampleIModels.RetailBuilding],
    type: "MisclassificationApp.tsx",
  });
}
