/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import VolumeQueryUI from "./VolumeQueryUI";

export function getVolumeQuerySpec(): SampleSpec {
  return ({
    name: "volume-query-sample",
    label: "Volume Query",
    image: "volume-query-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "VolumeQueryUI.tsx", import: import("!!raw-loader!./VolumeQueryUI"), entry: true },
      { name: "VolumeQueryApp.tsx", import: import("!!raw-loader!./VolumeQueryApp") },
      { name: "ProgressBar.tsx", import: import("!!raw-loader!./ProgressBar") },
    ],
    customModelList: [
      SampleIModels.RetailBuilding,
      SampleIModels.BayTown,
      SampleIModels.House,
      SampleIModels.Stadium,
      SampleIModels.MetroStation,
    ],
    sampleClass: VolumeQueryUI,
  });
}
