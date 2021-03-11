/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "@itwinjs-sandbox";
import ReadSettingsUI from "./ReadSettingsUI";

export function getReadSettingsSpec(): SampleMetadata {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "read-settings-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp") },
      { name: "ReadSettingsUI.tsx", import: import("!!raw-loader!./ReadSettingsUI"), entry: true },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    modelList: [SampleIModels.BayTown],
    sampleClass: ReadSettingsUI,
  });
}
