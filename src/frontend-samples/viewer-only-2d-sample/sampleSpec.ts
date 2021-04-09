/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewerOnly2dApi.ts", import: import("!!raw-loader!./ViewerOnly2dApi") },
      { name: "ViewerOnly2dApp.tsx", import: import("!!raw-loader!./ViewerOnly2dApp"), entry: true },
      { name: "ViewerOnly2dWidget.tsx", import: import("!!raw-loader!./ViewerOnly2dWidget"), entry: true },
      { name: "ViewerOnly2d.scss", import: import("!!raw-loader!./ViewerOnly2d.scss") },
    ],
    iModelList: [SampleIModels.House, SampleIModels.MetroStation],
    type: "ViewerOnly2dApp.tsx",
  });
}
