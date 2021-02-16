/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { ViewClipUI } from "./ViewClipUI";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewClipUI.tsx", import: import("!!raw-loader!./ViewClipUI"), entry: true },
      { name: "ViewClipApp.tsx", import: import("!!raw-loader!./ViewClipApp") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: ViewClipUI,
  });
}
