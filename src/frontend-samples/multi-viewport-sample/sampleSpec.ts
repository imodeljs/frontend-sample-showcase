/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getMultiViewportSpec(): SampleSpec {
  return ({
    name: "multi-viewport-sample",
    label: "Multiple Viewports",
    image: "multi-viewport-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./README.md"),
    files: () => [
      { name: "MultiViewportApi.ts", import: import("-!raw-loader!./MultiViewportApi") },
      { name: "MultiViewportApp.tsx", import: import("-!raw-loader!./MultiViewportApp"), entry: true },
      { name: "MultiViewportWidget.tsx", import: import("-!raw-loader!./MultiViewportWidget") },
      { name: "MultiViewportFrontstageProvider.tsx", import: import("-!raw-loader!./MultiViewportFrontstageProvider") },
      { name: "multi-view-sample.scss", import: import("-!raw-loader!./multi-view-sample.scss") },
    ],
    type: "MultiViewportApp.tsx",
  });
}
