/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample-2",
    label: "Read Settings 2",
    image: "read-settings-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp") },
      { name: "ReadSettingsUI.tsx", import: import("!!raw-loader!./ReadSettingsUI"), entry: true },
      { name: "ReadSettingsWidget.tsx", import: import("!!raw-loader!./ReadSettingsWidget") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    modelList: [SampleIModels.BayTown],
    type: "ReadSettingsUI.tsx",
  });
}
