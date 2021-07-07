/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";
import walkthrough from "!walkthrough-loader!./walkthru.md";

export function getValidationSpec(): SampleSpec {
  return ({
    name: "validation-sample",
    label: "Validation",
    image: "validation.png",
    description: "Uses the #validation REST api.",
    readme: async () => import("!!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    //walkthrough,
    files: () => [
      { name: "./ValidationApi.ts", import: import("!!raw-loader!./ValidationApi") },
      { name: "./ValidationApp.tsx", import: import("!!raw-loader!./ValidationApp.tsx"), entry: true },
      { name: "./ValidationClient.ts", import: import("!!raw-loader!./ValidationClient.ts") },
      { name: "./ValidationWidget.tsx", import: import("!!raw-loader!./ValidationWidget.tsx") },
      { name: "./ValidationTableWidget.tsx", import: import("!!raw-loader!./ValidationTableWidget.tsx") },
      { name: "frontend-samples/marker-pin-sample/MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "frontend-samples/marker-pin-sample/PopupMenu.tsx", import: import("!!raw-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx") },
      { name: "./ValidationResultJson.ts", import: import("!!raw-loader!./ValidationResultJson.ts") },
      { name: "./ValidationRuleJson.ts", import: import("!!raw-loader!./ValidationRuleJson.ts") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ValidationApp.tsx",
  });
}
