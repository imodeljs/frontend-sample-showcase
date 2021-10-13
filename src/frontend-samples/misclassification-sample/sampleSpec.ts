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
    image: "misclassification-thumbnail.png",
    description: "Uses the #Classification Validation API to get and visualize #misclassified elements from a #misclassification test run in the Machine #Learning API.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./MisclassificationApi.ts"),
      import("!editor-file-loader!./MisclassificationApp.tsx"),
      import("!editor-file-loader!./MisclassificationClient.ts"),
      import("!editor-file-loader!./MisclassificationTableWidget.tsx"),
      import("!editor-file-loader!./MisclassificationJson.ts"),
    ],
    iModelList: [SampleIModels.RetailBuilding],
    type: "MisclassificationApp.tsx",
  });
}
