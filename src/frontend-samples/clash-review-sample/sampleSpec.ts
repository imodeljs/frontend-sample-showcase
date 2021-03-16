/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ClashReviewUI from "./ClashReviewUI";

export function getClashReviewSpec(): SampleSpec {
  return ({
    name: "clash-review-sample",
    label: "Clash Review",
    image: "clashreview.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "frontend-samples/clash-review-sample/ClashReviewApp.tsx", import: import("!!raw-loader!./ClashReviewApp.tsx") },
      { name: "frontend-samples/clash-review-sample/ClashReviewUI.tsx", import: import("!!raw-loader!./ClashReviewUI.tsx"), entry: true },
      { name: "frontend-samples/clash-review-sample/ClashDetectionApis.ts", import: import("!!raw-loader!./ClashDetectionApis.ts") },
      { name: "frontend-samples/clash-review-sample/ClashTable.tsx", import: import("!!raw-loader!./ClashTable.tsx") },
      { name: "frontend-samples/marker-pin-sample/MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "frontend-samples/marker-pin-sample/PopupMenu.tsx", import: import("!!raw-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx") },
      { name: "frontend-samples/clash-review-sample/ClashDetectionJsonData.ts", import: import("!!raw-loader!./ClashDetectionJsonData.ts") },
      { name: "frontend-samples/clash-review-sample/ClashReview.scss", import: import("!!raw-loader!./ClashReview.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: ClashReviewUI,
  });
}
