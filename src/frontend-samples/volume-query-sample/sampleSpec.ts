/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getVolumeQuerySpec(): SampleSpec {
  return ({
    name: "volume-query-sample",
    label: "Volume Query",
    image: "volume-query-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "VolumeQueryApi.ts", import: import("!!raw-loader!./VolumeQueryApi") },
      { name: "VolumeQueryApp.tsx", import: import("!!raw-loader!./VolumeQueryApp"), entry: true },
      { name: "VolumeQueryWidget.tsx", import: import("!!raw-loader!./VolumeQueryWidget") },
      { name: "VolumeQuery.scss", import: import("!!raw-loader!./VolumeQuery.scss") },
    ],
    iModelList: [SampleIModels.RetailBuilding],
    type: "VolumeQueryApp.tsx",
  });
}
