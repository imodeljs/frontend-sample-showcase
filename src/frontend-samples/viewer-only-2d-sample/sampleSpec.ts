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
      { name: "ViewerOnly2dApp.tsx", import: import("!!raw-loader!./ViewerOnly2dApp") },
      { name: "ViewerOnly2dUI.tsx", import: import("!!raw-loader!./ViewerOnly2dUI"), entry: true },
      { name: "ViewerOnly2dWidget.tsx", import: import("!!raw-loader!./ViewerOnly2dWidget") },
    ],
    modelList: [SampleIModels.House, SampleIModels.MetroStation],
    type: "ViewerOnly2dUI.tsx",
  });
}
