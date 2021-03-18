/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import RealityDataUI from "./RealityDataUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getRealityDataSpec(): SampleSpec {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    iTwinViewerReady: true,
    files: [
      { name: "RealityDataApp.tsx", import: import("!!raw-loader!./RealityDataApp") },
      { name: "RealityDataUI.tsx", import: import("!!raw-loader!./RealityDataUI"), entry: true },
      { name: "RealityDataWidget.tsx", import: import("!!raw-loader!./RealityDataWidget") },
    ],
    modelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    sampleClass: RealityDataUI,
  });
}
