/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House],
    readme: () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ScreenSpaceEffectsUI.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsUI"), entry: true },
      { name: "ScreenSpaceEffectsApp.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsApp") },

      { name: "Effects.ts", import: import("!!raw-loader!./Effects") },
    ],
    type: "ScreenSpaceEffectsUI",
  });
}

