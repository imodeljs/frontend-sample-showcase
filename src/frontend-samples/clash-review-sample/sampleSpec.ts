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
    readme: async () => import("!!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    files: () => [
      { name: "frontend-samples/clash-review-sample/ClashReviewApp.tsx", import: import("!!raw-loader!./ClashReviewApp.tsx") },
      { name: "frontend-samples/clash-review-sample/ClashReviewUI.tsx", import: import("!!raw-loader!./ClashReviewUI.tsx"), entry: true },
      { name: "frontend-samples/clash-review-sample/ClashDetectionApis.ts", import: import("!!raw-loader!./ClashDetectionApis.ts") },
      { name: "frontend-samples/clash-review-sample/ClashReviewWidget.tsx", import: import("!!raw-loader!./ClashReviewWidget.tsx") },
      { name: "frontend-samples/clash-review-sample/ClashReviewTableWidget.tsx", import: import("!!raw-loader!./ClashReviewTableWidget.tsx") },
      { name: "frontend-samples/marker-pin-sample/MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "frontend-samples/marker-pin-sample/PopupMenu.tsx", import: import("!!raw-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx") },
      { name: "frontend-samples/clash-review-sample/ClashDetectionJsonData.ts", import: import("!!raw-loader!./ClashDetectionJsonData.ts") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ClashReviewUI.tsx",
  });
}
