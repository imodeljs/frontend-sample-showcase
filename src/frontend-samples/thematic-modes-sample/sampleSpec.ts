/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import ThematicModesApp from "./ThematicModesApp";

export function getThematicModesSpec(): SampleSpec {
  return ({
    name: "thematic-modes-sample",
    label: "Thematic Display Modes",
    image: "thematic-display-thumbnail.png",
    // image: "thematic-modes-thumbnail.png",
    files: [
      { name: "ThematicModesApp.tsx", import: import("!!raw-loader!./ThematicModesApp"), entry: true },
      { name: "ThematicModesUI.tsx", import: import("!!raw-loader!./ThematicModesUI") },
    ],
    customModelList: [SampleIModels.CoffsHarborDemo, SampleIModels.MetroStation],
    // customModelList: ["CoffsHarborDemo", SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    setup: ThematicModesApp.setup,
    teardown: ThematicModesApp.teardown,
  });
}
