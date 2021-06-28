/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getIotAlertSpec(): SampleSpec {
  return ({
    name: "iot-alert-sample",
    label: "IoT Alerts",
    image: "IoT-Alert-thumbnail.png",
    description: "How to simulate out-of-bound condition from a #sensor and trigger #IotAlert, #blinking effect",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "IotAlertApi.tsx", import: import("!!raw-loader!./IotAlertApi") },
      { name: "IotAlertApp.tsx", import: import("!!raw-loader!./IotAlertApp"), entry: true },
      { name: "IotAlertWidget.tsx", import: import("!!raw-loader!./IotAlertWidget") },
      { name: "IotAlert.scss", import: import("!!raw-loader!./IotAlert.scss") },
    ],
    iModelList: [SampleIModels.BayTown],
    type: "IotAlertApp.tsx",
  });
}
