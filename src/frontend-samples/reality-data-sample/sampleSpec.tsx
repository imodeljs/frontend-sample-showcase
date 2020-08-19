/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import RealityDataApp from "./RealityDataApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getRealityDataSpec(): SampleSpec {
  return ({
    name: "reality-data-sample",
    label: "Reality Data",
    image: "reality-data-thumbnail.png",
    files: [
      { name: "RealityDataApp.tsx", import: import("!!raw-loader!./RealityDataApp"), entry: true },
      { name: "RealityDataUI.tsx", import: import("!!raw-loader!./RealityDataUI") },
    ],
    customModelList: [SampleIModels.ExtonCampus],
    setup: RealityDataApp.setup,
  });
}
