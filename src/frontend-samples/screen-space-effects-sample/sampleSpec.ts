/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getScreenSpaceEffectsSpec(): SampleSpec {
  return ({
    name: "screen-space-effects-sample",
    label: "Screen-space Effects",
    image: "screen-space-effects-thumbnail.png",
    iModelList: [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ScreenSpaceEffectsApi"),
      import("!editor-file-loader!./ScreenSpaceEffectsApp?entry=true"),
      import("!editor-file-loader!./ScreenSpaceEffectsWidget"),
      import("!editor-file-loader!./Effects"),
      import("!editor-file-loader!./ScreenSpaceEffects.scss"),
    ],
    type: "ScreenSpaceEffectsApp.tsx",
  });
}

