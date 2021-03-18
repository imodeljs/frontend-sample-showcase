/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    modelList: [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ScreenSpaceEffectsApp.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsApp") },
      { name: "ScreenSpaceEffectsUI.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsUI"), entry: true },
      { name: "Effects.ts", import: import("!!raw-loader!./Effects") },
    ],
    type: "ScreenSpaceEffectsUI.tsx",
  });
}

