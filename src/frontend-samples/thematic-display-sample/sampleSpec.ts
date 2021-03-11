/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "@itwinjs-sandbox";
import ThematicDisplaySampleUI from "./ThematicDisplayUI";

export function getThematicDisplaySpec(): SampleMetadata {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ThematicDisplayApp.tsx", import: import("!!raw-loader!./ThematicDisplayApp") },
      { name: "ThematicDisplayUI.tsx", import: import("!!raw-loader!./ThematicDisplayUI"), entry: true },
    ],
    modelList: [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding],
    sampleClass: ThematicDisplaySampleUI,
  });
}
