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
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./annotations.md"),
    }),
    readme: async () => import("!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./RealityDataApi"),
      import("!editor-file-loader!./RealityDataApp?entry=true"),
      import("!editor-file-loader!./RealityDataWidget"),
      import("!editor-file-loader!./RealityData.scss"),
    ],
    iModelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    type: "RealityDataApp.tsx",
    description: "Adding, removing, and modifying the display of #reality data. Discovers available #realitymodel and attaches the first one to the viewport.",
  });
}
