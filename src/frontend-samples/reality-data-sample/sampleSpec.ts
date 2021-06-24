/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";
import walkthrough from "!walkthrough-loader!./annotations.md";

export function getRealityDataSpec(): SampleSpec {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    iTwinViewerReady: true,
    walkthrough,
    readme: async () => import("!raw-loader!./readme.md"),
    files: () => [
      { name: "RealityDataApi.ts", import: import("!editor-file-loader!./RealityDataApi") },
      { name: "RealityDataApp.tsx", import: import("!editor-file-loader!./RealityDataApp"), entry: true },
      { name: "RealityDataWidget.tsx", import: import("!editor-file-loader!./RealityDataWidget") },
      { name: "RealityData.scss", import: import("!editor-file-loader!./RealityData.scss") },
    ],
    iModelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    type: "RealityDataApp.tsx",
    description: "Adding, removing, and modifying the display of #reality data. Discovers available #realitymodel and attaches the first one to the viewport.",
  });
}
