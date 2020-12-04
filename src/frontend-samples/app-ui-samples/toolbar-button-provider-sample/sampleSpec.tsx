/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../../Components/IModelSelector/IModelSelector";
import { ToolbarButtonSample } from "./ToolbarButtonApp";

export function getToolbarButtonSample(): SampleSpec {
  return ({
    name: "toolbar-button-sample",
    label: "Add Toolbar Button (Dynamically)",
    image: "toolbar-button-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ToolbarButtonApp.tsx", import: import("!!raw-loader!./ToolbarButtonApp"), entry: true },
      { name: "ToolbarButtonUi.tsx", import: import("!!raw-loader!./ToolbarButtonUi") },
    ],
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    setup: ToolbarButtonSample.setup.bind(ToolbarButtonSample),
    teardown: ToolbarButtonSample.teardown.bind(ToolbarButtonSample),
  });
}
