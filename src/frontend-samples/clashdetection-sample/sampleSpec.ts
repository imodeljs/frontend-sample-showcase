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
    label: "Clash Detection Data",
    image: "clashdetection.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClashDetectionApp.tsx", import: import("!!raw-loader!./ClashDetectionApp.tsx"), entry: true },
      { name: "ClashDetectionUI.tsx", import: import("!!raw-loader!./ClashDetectionUI.tsx") },
      { name: "ClashDetectionApis.ts", import: import("!!raw-loader!./ClashDetectionApis.ts") },
      { name: "ClashMarkers.ts", import: import("!!raw-loader!./ClashMarkers.ts") },
      { name: "ClashTable.tsx", import: import("!!raw-loader!./ClashTable.tsx") },
      { name: "EmphasizeElements.tsx", import: import("!!raw-loader!./EmphasizeElements.tsx") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: ClashDetectionUI,
  });
}
