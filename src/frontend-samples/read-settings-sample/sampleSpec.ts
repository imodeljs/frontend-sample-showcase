/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "read-settings-thumbnail.png",
    description: "Reads and writes custom #userSettings associated with an iModel",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ReadSettingsApi.ts", import: import("!!raw-loader!./ReadSettingsApi") },
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp"), entry: true },
      { name: "ReadSettingsWidget.tsx", import: import("!!raw-loader!./ReadSettingsWidget") },
      { name: "ReadSettings.scss", import: import("!!raw-loader!./ReadSettings.scss") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ReadSettingsApp.tsx",
  });
}
