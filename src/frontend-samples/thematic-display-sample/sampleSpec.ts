/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ThematicDisplayApp.tsx", import: import("!!raw-loader!./ThematicDisplayApp") },
      { name: "ThematicDisplayUI.tsx", import: import("!!raw-loader!./ThematicDisplayUI"), entry: true },
    ],
    modelList: [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding],
    type: "ThematicDisplayUI.tsx",
  });
}
