/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getRealityDataSpec(): SampleSpec {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "RealityDataUI.tsx", import: import("!!raw-loader!./RealityDataUI"), entry: true },
      { name: "RealityDataApp.tsx", import: import("!!raw-loader!./RealityDataApp") },
    ],
    customModelList: [SampleIModels.ExtonCampus, SampleIModels.MetroStation],
    type: "RealityDataUI",
  });
}
