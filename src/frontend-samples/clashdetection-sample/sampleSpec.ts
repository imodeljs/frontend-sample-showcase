/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ClashDetectionUI from "./ClashDetectionUI";

export function getClashDetectionSpec(): SampleSpec {
  return ({
    name: "clashdetection-sample",
    label: "Clash Detection",
    image: "clashdetection.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClashDetectionApp.tsx", import: import("!!raw-loader!./ClashDetectionApp.tsx"), entry: true },
      { name: "ClashDetectionUI.tsx", import: import("!!raw-loader!./ClashDetectionUI.tsx") },
      { name: "ClashDetectionApis.ts", import: import("!!raw-loader!./ClashDetectionApis.ts") },
      { name: "ClashTable.tsx", import: import("!!raw-loader!./ClashTable.tsx") },
      { name: "MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "ClashDetectionJsonData.ts", import: import("!!raw-loader!./ClashDetectionJsonData.ts") },
      { name: "ClashDetection.scss", import: import("!!raw-loader!./ClashDetection.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: ClashDetectionUI,
  });
}
