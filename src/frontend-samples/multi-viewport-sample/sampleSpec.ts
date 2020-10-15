/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import MultiViewportApp from "./MultiViewportApp";

export function getMultiViewportSpec(): SampleSpec {
  return ({
    name: "multi-viewport-sample",
    label: "Multiple Viewports",
    image: "multi-viewport-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "MultiViewportApp.tsx", import: import("!!raw-loader!./MultiViewportApp"), entry: true },
      { name: "MultiViewportUI.tsx", import: import("!!raw-loader!./MultiViewportUI") },
      { name: "multi-view-sample.scss", import: import("!!raw-loader!./multi-view-sample.scss") },
    ],
    setup: MultiViewportApp.setup.bind(MultiViewportApp),
    teardown: MultiViewportApp.teardown.bind(MultiViewportApp),
  });
}
