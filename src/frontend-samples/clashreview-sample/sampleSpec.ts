/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ClashReviewUI from "./ClashReviewUI";

export function getClashReviewSpec(): SampleSpec {
  return ({
    name: "clashreview-sample",
    label: "Clash Review",
    image: "clashreview.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClashReviewApp.tsx", import: import("!!raw-loader!./ClashReviewApp.tsx"), entry: true },
      { name: "ClashReviewUI.tsx", import: import("!!raw-loader!./ClashReviewUI.tsx") },
      { name: "ClashDetectionApis.ts", import: import("!!raw-loader!./ClashDetectionApis.ts") },
      { name: "ClashTable.tsx", import: import("!!raw-loader!./ClashTable.tsx") },
      { name: "MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx") },
      { name: "ClashDetectionJsonData.ts", import: import("!!raw-loader!./ClashDetectionJsonData.ts") },
      { name: "ClashReview.scss", import: import("!!raw-loader!./ClashReview.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: ClashReviewUI,
  });
}
