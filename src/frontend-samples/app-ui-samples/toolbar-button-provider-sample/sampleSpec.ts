/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getToolbarButtonSample(): SampleSpec {
  return ({
    name: "toolbar-button-sample",
    label: "Add Toolbar Button (Dynamically)",
    image: "toolbar-button-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ToolbarButtonUi.tsx", import: import("!!raw-loader!./ToolbarButtonUi") },
      { name: "ToolbarButtonApp.tsx", import: import("!!raw-loader!./ToolbarButtonApp"), entry: true },
    ],
    iModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    type: "ToolbarButtonApp.tsx",
  });
}
