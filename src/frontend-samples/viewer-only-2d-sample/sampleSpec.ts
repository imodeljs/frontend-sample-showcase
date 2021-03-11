/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import { SampleIModels } from "@itwinjs-sandbox";
import ViewerOnly2dUI from "./ViewerOnly2dUI";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    iTwinViewerReady: true,
    files: [
      { name: "ViewerOnly2dApp.tsx", import: import("!!raw-loader!./ViewerOnly2dApp") },
      { name: "ViewerOnly2dUI.tsx", import: import("!!raw-loader!./ViewerOnly2dUI"), entry: true },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
    ],
    modelList: [SampleIModels.House, SampleIModels.MetroStation],
    sampleClass: ViewerOnly2dUI,
  });
}
