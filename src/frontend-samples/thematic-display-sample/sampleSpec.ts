/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    readme: () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ThematicDisplayUI.tsx", import: import("!!raw-loader!./ThematicDisplayUI"), entry: true },
      { name: "ThematicDisplayApp.tsx", import: import("!!raw-loader!./ThematicDisplayApp") },
    ],
    customModelList: [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding],
    type: "ThematicDisplayUI.tsx",
  });
}
