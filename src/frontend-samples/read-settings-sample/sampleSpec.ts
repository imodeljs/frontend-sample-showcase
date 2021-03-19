/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "read-settings-thumbnail.png",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ReadSettingsApp.tsx", import: import("!!raw-loader!./ReadSettingsApp") },
      { name: "ReadSettingsUI.tsx", import: import("!!raw-loader!./ReadSettingsUI"), entry: true },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    modelList: [SampleIModels.BayTown],
    type: "ReadSettingsUI.tsx",
  });
}
