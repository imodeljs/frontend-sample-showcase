/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    iModelList: [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House],
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./README.md"),
    files: () => [
      { name: "ScreenSpaceEffectsApi.tsx", import: import("-!raw-loader!./ScreenSpaceEffectsApi") },
      { name: "ScreenSpaceEffectsApp.tsx", import: import("-!raw-loader!./ScreenSpaceEffectsApp"), entry: true },
      { name: "ScreenSpaceEffectsWidget.tsx", import: import("-!raw-loader!./ScreenSpaceEffectsWidget") },
      { name: "Effects.ts", import: import("-!raw-loader!./Effects") },
      { name: "ScreenSpaceEffects.scss", import: import("-!raw-loader!./ScreenSpaceEffects.scss") },
    ],
    type: "ScreenSpaceEffectsApp.tsx",
  });
}

