/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getClashReviewSpec(): SampleSpec {
  return ({
    name: "clash-review-sample",
    label: "Clash Review",
    image: "clashreview.png",
    description: "Uses the #validation REST api to get and visualize #clash results.",
    readme: async () => import("!!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    files: () => [
      { name: "./ClashReviewApi.ts", import: import("!!raw-loader!./ClashReviewApi") },
      { name: "./ClashReviewApp.tsx", import: import("!!raw-loader!./ClashReviewApp.tsx"), entry: true },
      { name: "./ClashDetectionClient.ts", import: import("!!raw-loader!./ClashDetectionClient.ts") },
      { name: "./ClashReviewWidget.tsx", import: import("!!raw-loader!./ClashReviewWidget.tsx") },
      { name: "./ClashReviewTableWidget.tsx", import: import("!!raw-loader!./ClashReviewTableWidget.tsx") },
      { name: "frontend-samples/marker-pin-sample/MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "frontend-samples/marker-pin-sample/PopupMenu.tsx", import: import("!!raw-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx") },
      { name: "./ClashDetectionJsonData.ts", import: import("!!raw-loader!./ClashDetectionJsonData.ts") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ClashReviewApp.tsx",
  });
}
