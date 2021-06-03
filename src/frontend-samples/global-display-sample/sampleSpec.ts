/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getGlobalDisplaySpec(): SampleSpec {
  return ({
    name: "global-display-sample",
    label: "Global Data",
    image: "global-display-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "GlobalDisplayApi.ts", import: import("!!raw-loader!./GlobalDisplayApi") },
      { name: "GlobalDisplayApp.tsx", import: import("!!raw-loader!./GlobalDisplayApp"), entry: true },
      { name: "GlobalDisplayWidget.tsx", import: import("!!raw-loader!./GlobalDisplayWidget") },
      { name: "GlobalDisplay.scss", import: import("!!raw-loader!./GlobalDisplay.scss") },
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "GlobalDisplayApp.tsx",
  });
}

