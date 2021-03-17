/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getParticleFireSampleSpec(): SampleSpec {
  return ({
    name: "fire-sample",
    label: "Particle Effect (Fire)",
    image: "fire-decorator-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.BayTown, SampleIModels.House],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "FireDecorationApp.tsx", import: import("!!raw-loader!./FireDecorationApp"), entry: true },
      { name: "FireDecorationUI.tsx", import: import("!!raw-loader!./FireDecorationUI") },
      { name: "FireDecorator.ts", import: import("!!raw-loader!./FireDecorator") },
      { name: "PlacementTool.ts", import: import("!!raw-loader!./PlacementTool") },
    ],
    type: "FireDecorationUI.tsx",
  });
}
