/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ScreenSpaceEffectsApp from "./ScreenSpaceEffectsApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ScreenSpaceEffectsApp.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsApp"), entry: true },
      { name: "ScreenSpaceEffectsUI.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsUI") },
      { name: "Effects.ts", import: import("!!raw-loader!./Effects") },
    ],
    setup: ScreenSpaceEffectsApp.setup.bind(ScreenSpaceEffectsApp),
  });
}

