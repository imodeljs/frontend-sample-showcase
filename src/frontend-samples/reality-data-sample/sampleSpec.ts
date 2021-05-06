/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getRealityDataSpec(): SampleSpec {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "RealityDataApi.ts", import: import("!!raw-loader!./RealityDataApi") },
      { name: "RealityDataApp.tsx", import: import("!!raw-loader!./RealityDataApp"), entry: true },
      { name: "RealityDataWidget.tsx", import: import("!!raw-loader!./RealityDataWidget") },
      { name: "RealityData.scss", import: import("!!raw-loader!./RealityData.scss") },
    ],
    iModelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    type: "RealityDataApp.tsx",
  });
}
