/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getParticleSnowSampleSpec(): SampleSpec {
  return ({
    name: "snow-sample",
    label: "Particle Effect (Snow)",
    image: "snow-decorator-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "SnowDecorationApp.tsx", import: import("!!raw-loader!./SnowDecorationApp") },
      { name: "SnowDecorationUI.tsx", import: import("!!raw-loader!./SnowDecorationUI"), entry: true },
      { name: "SnowDecorator.ts", import: import("!!raw-loader!./SnowDecorator") },
    ],
    type: "SnowDecorationUI.tsx",
  });
}
