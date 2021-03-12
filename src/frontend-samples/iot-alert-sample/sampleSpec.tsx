/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import IotAlertUI from "./IotAlertUI";

export function getIotAlertSpec(): SampleSpec {
  return ({
    name: "iot-alert-sample",
    label: "IoT Alerts",
    image: "IoT-Alert-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "IotAlertApp.tsx", import: import("!!raw-loader!./IotAlertApp"), entry: true },
      { name: "IotAlertUI.tsx", import: import("!!raw-loader!./IotAlertUI") },
    ],
    customModelList: [SampleIModels.BayTown],
    sampleClass: IotAlertUI,
  });
}
