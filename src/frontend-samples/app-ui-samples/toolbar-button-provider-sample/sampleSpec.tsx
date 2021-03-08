/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/


import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";
import ToolbarButtonSample from "./ToolbarButtonApp";

export function getToolbarButtonSample(): SampleSpec {
  return ({
    name: "toolbar-button-sample",
    label: "Add Toolbar Button (Dynamically)",
    image: "toolbar-button-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ToolbarButtonUi.tsx", import: import("!!raw-loader!./ToolbarButtonUi"), entry: true },
      { name: "ToolbarButtonApp.tsx", import: import("!!raw-loader!./ToolbarButtonApp") },
    ],
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: ToolbarButtonSample,
    type: "ToolbarButtonSample",
  });
}
