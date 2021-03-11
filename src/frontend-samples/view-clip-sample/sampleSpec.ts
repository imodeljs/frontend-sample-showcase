/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import { SampleIModels } from "@itwinjs-sandbox";
import ViewClipUI from "./ViewClipUI";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewClipApp.tsx", import: import("!!raw-loader!./ViewClipApp") },
      { name: "ViewClipUI.tsx", import: import("!!raw-loader!./ViewClipUI"), entry: true },
    ],
    sampleClass: ViewClipUI,
    modelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
  });
}
