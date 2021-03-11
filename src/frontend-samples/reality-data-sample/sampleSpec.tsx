/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import RealityDataUI from "./RealityDataUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getRealityDataSpec(): SampleMetadata {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "RealityDataApp.tsx", import: import("!!raw-loader!./RealityDataApp") },
      { name: "RealityDataUI.tsx", import: import("!!raw-loader!./RealityDataUI"), entry: true },
    ],
    modelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    sampleClass: RealityDataUI,
  });
}
