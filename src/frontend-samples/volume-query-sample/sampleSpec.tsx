/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import { SampleIModels } from "@itwinjs-sandbox";
import VolumeQueryUI from "./VolumeQueryUI";

export function getVolumeQuerySpec(): SampleSpec {
  return ({
    name: "volume-query-sample",
    label: "Volume Query",
    image: "volume-query-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "VolumeQueryApp.tsx", import: import("!!raw-loader!./VolumeQueryApp") },
      { name: "VolumeQueryUI.tsx", import: import("!!raw-loader!./VolumeQueryUI"), entry: true },
      { name: "ProgressBar.tsx", import: import("!!raw-loader!./ProgressBar") },
    ],
    modelList: [
      SampleIModels.RetailBuilding,
      SampleIModels.BayTown,
      SampleIModels.House,
      SampleIModels.Stadium,
      SampleIModels.MetroStation,
    ],
    sampleClass: VolumeQueryUI,
  });
}
