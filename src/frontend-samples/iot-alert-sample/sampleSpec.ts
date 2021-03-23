/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getIotAlertSpec(): SampleSpec {
  return ({
    name: "iot-alert-sample",
    label: "IoT Alerts",
    image: "IoT-Alert-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "IotAlertApp.tsx", import: import("!!raw-loader!./IotAlertApp") },
      { name: "IotAlertUI.tsx", import: import("!!raw-loader!./IotAlertUI"), entry: true },
      { name: "IotAlert.scss", import: import("!!raw-loader!./IotAlert.scss") },
    ],
    customModelList: [SampleIModels.BayTown],
    type: "IotAlertUI.tsx",
  });
}
