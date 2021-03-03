/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import FireDecorationUI from "./ParticleSampleUI";

export function getParticleSampleSpec(): SampleSpec {
  return ({
    name: "fire-sample",
    label: "Fire Decorator",
    image: "view-attributes-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.BayTown, SampleIModels.House],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ParticleSampleUI.tsx", import: import("!!raw-loader!./ParticleSampleUI"), entry: true },
      { name: "ParticleSampleApp.tsx", import: import("!!raw-loader!./ParticleSampleApp") },
      { name: "Particle.ts", import: import("!!raw-loader!./Particle") },
      { name: "PlacementTool.ts", import: import("!!raw-loader!./PlacementTool") },
    ],
    sampleClass: FireDecorationUI,
  });
}
