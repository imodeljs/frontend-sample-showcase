/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import MultiViewportUI from "./MultiViewportUI";

export function getMultiViewportSpec(): SampleSpec {
  return ({
    name: "multi-viewport-sample",
    label: "Multiple Viewports",
    image: "multi-viewport-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "MultiViewportUI.tsx", import: import("!!raw-loader!./MultiViewportUI"), entry: true },
      { name: "MultiViewportApp.tsx", import: import("!!raw-loader!./MultiViewportApp") },
      { name: "multi-view-sample.scss", import: import("!!raw-loader!./multi-view-sample.scss") },
    ],
    sampleClass: MultiViewportUI,
  });
}
