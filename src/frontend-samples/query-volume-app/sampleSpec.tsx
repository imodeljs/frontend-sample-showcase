/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { VolumeQueryApp } from "./VolumeQueryApp";

export function getVolumeQuerySpec(): SampleSpec {
  return ({
    name: "Volume Query",
    label: "Volume Query",
    image: "view-clip-thumbnail.png",
    files: [
      { name: "VolumeQueryApp.tsx", import: import("!!raw-loader!./VolumeQueryApp"), entry: true },
      { name: "VolumeQueryUI.tsx", import: import("!!raw-loader!./VolumeQueryUI") },
    ],
    customModelList: [
      SampleIModels.RetailBuilding,
      SampleIModels.BayTown,
      SampleIModels.House,
    ],
    setup: VolumeQueryApp.setup,
  });
}
