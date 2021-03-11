/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "@itwinjs-sandbox";
import ZoomToElementsUI from "./ZoomToElementsUI";

export function getZoomToElementsSpec(): SampleMetadata {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ZoomToElementsApp.tsx", import: import("!!raw-loader!./ZoomToElementsApp") },
      { name: "ZoomToElementsUI.tsx", import: import("!!raw-loader!./ZoomToElementsUI"), entry: true },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    modelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: ZoomToElementsUI,
  });
}
