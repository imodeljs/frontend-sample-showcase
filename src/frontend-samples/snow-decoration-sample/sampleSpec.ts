/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getParticleSnowSampleSpec(): SampleSpec {
  return ({
    name: "snow-rain-sample",
    label: "Particle Effect (Snow & Rain)",
    image: "snow-decorator-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "SnowDecorationApp.tsx", import: import("!!raw-loader!./SnowDecorationApp"), entry: true },
      { name: "SnowDecorationUI.tsx", import: import("!!raw-loader!./SnowDecorationUI") },
      { name: "SnowDecorator.ts", import: import("!!raw-loader!./SnowDecorator") },
    ],
    type: "SnowDecorationUI.tsx",
  });
}
