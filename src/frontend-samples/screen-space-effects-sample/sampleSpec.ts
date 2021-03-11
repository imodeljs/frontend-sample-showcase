/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import ScreenSpaceEffectsUI from "./ScreenSpaceEffectsUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    modelList: [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ScreenSpaceEffectsApp.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsApp") },
      { name: "ScreenSpaceEffectsUI.tsx", import: import("!!raw-loader!./ScreenSpaceEffectsUI"), entry: true },
      { name: "Effects.ts", import: import("!!raw-loader!./Effects") },
    ],
    sampleClass: ScreenSpaceEffectsUI,
  });
}

