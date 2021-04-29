/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewClipApi.ts", import: import("!!raw-loader!./ViewClipApi") },
      { name: "ViewClipApp.tsx", import: import("!!raw-loader!./ViewClipApp"), entry: true },
      { name: "ViewClipWidget.tsx", import: import("!!raw-loader!./ViewClipWidget") },
      { name: "ViewClip.scss", import: import("!!raw-loader!./ViewClipWidget") },
    ],
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    type: "ViewClipApp.tsx",
  });
}
