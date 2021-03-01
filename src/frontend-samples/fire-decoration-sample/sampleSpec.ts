/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import FireDecorationApp from "./ParticleSampleApp";

export function getParticleSampleSpec(): SampleSpec {
  return ({
    name: "particle-sample",
    label: "Particle Decoration",
    image: "view-attributes-thumbnail.png",
    customModelList: [SampleIModels.BayTown, SampleIModels.House, SampleIModels.Villa],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ParticleSampleApp.tsx", import: import("!!raw-loader!./ParticleSampleApp"), entry: true },
      { name: "ParticleSampleUI.tsx", import: import("!!raw-loader!./ParticleSampleUI") },
      { name: "Particle.ts", import: import("!!raw-loader!./Particle") },
      { name: "PlacementTool.ts", import: import("!!raw-loader!./PlacementTool") },
    ],
    setup: FireDecorationApp.setup.bind(FireDecorationApp),
    teardown: FireDecorationApp.teardown.bind(FireDecorationApp),
  });
}
