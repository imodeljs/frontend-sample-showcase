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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ViewClipApi"),
      import("!editor-file-loader!./ViewClipApp?entry=true"),
      import("!editor-file-loader!./ViewClipWidget"),
      import("!editor-file-loader!./ViewClipWidget"),
    ],
    iTwinViewerReady: true,
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    type: "ViewClipApp.tsx",
    description: "How to add a #ClipVolume, #ClipPlane, and #ViewClipDecorationProvider to a view to #clip the geometry",
  });
}
