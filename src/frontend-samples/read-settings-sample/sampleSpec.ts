/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getReadSettingsSpec(): SampleSpec {
  return ({
    name: "read-settings-sample",
    label: "Read Settings",
    image: "read-settings-thumbnail.png",
    description: "Reads and writes custom #userSettings associated with an iModel",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ReadSettingsApi"),
      import("!editor-file-loader!./ReadSettingsApp?entry=true"),
      import("!editor-file-loader!./ReadSettingsWidget"),
      import("!editor-file-loader!./ReadSettings.scss"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ReadSettingsApp.tsx",
  });
}
