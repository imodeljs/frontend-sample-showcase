/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ReadSettingsUI from "./ReadSettingsUI";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "read-settings-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ReadSettingsUI.tsx", import: import("!!raw-loader!./ReadSettingsUI"), entry: true },
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: ReadSettingsUI,
  });
}
