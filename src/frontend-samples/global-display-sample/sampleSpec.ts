/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getGlobalDisplaySpec(): SampleSpec {
  return ({
    name: "global-display-sample",
    label: "Global Data",
    image: "global-display-thumbnail.png",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "GlobalDisplayUI.tsx", import: import("!!raw-loader!./GlobalDisplayUI"), entry: true },
      { name: "GlobalDisplayApp.tsx", import: import("!!raw-loader!./GlobalDisplayApp") },
    ],
    customModelList: [SampleIModels.MetroStation],
    type: "GlobalDisplayUI.tsx",
  });
}

