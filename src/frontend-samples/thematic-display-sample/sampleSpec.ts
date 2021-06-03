/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ThematicDisplayApi.ts", import: import("!!raw-loader!./ThematicDisplayApi") },
      { name: "ThematicDisplayApp.tsx", import: import("!!raw-loader!./ThematicDisplayApp"), entry: true },
      { name: "ThematicDisplayWidget.tsx", import: import("!!raw-loader!./ThematicDisplayWidget") },
      { name: "ThematicDisplay.scss", import: import("!!raw-loader!./ThematicDisplay.scss") },
    ],
    iModelList: [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding],
    type: "ThematicDisplayApp.tsx",
  });
}
