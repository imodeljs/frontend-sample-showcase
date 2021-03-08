/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewClipUI.tsx", import: import("!!raw-loader!./ViewClipUI"), entry: true },
      { name: "ViewClipApp.tsx", import: import("!!raw-loader!./ViewClipApp") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    type: "ViewClipUI",
  });
}
