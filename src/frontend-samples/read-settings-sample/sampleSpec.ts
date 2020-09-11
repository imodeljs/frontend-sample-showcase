/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ReadSettingsApp from "./ReadSettingsApp";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "zoom-to-elements-thumbnail.png",
    files: [
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp"), entry: true },
      { name: "ExternalSettingsUI.tsx", import: import("!!raw-loader!./ExternalSettingsUI") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    // customModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    setup: ReadSettingsApp.setup,
  });
}
