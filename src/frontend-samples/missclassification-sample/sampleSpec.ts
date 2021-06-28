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
    readme: async () => import("!!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    files: () => [
      { name: "frontend-samples/misclassification-sample/MisclassificationApi.ts", import: import("!!raw-loader!./MisclassificationApi") },
      { name: "frontend-samples/misclassification-sample/MisclassificationApp.tsx", import: import("!!raw-loader!./MisclassificationApp.tsx"), entry: true },
      { name: "frontend-samples/misclassification-sample/MisclassificationTableWidget.tsx", import: import("!!raw-loader!./MisclassificationTableWidget.tsx") },
      { name: "frontend-samples/misclassification-sample/MisclassificationsJson.ts", import: import("!!raw-loader!./MisclassificationsJson.ts") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "MisclassificationApp.tsx",
  });
}
