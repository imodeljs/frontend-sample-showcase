/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import GlobalDisplayUI from "./GlobalDisplayUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getGlobalDisplaySpec(): SampleSpec {
  return ({
    name: "global-display-sample",
    label: "Global Data",
    image: "global-display-thumbnail.png",
    customModelList: [SampleIModels.MetroStation],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "GlobalDisplayUI.tsx", import: import("!!raw-loader!./GlobalDisplayUI"), entry: true },
      { name: "GlobalDisplayApp.tsx", import: import("!!raw-loader!./GlobalDisplayApp") },
    ],
    sampleClass: GlobalDisplayUI,
  });
}

