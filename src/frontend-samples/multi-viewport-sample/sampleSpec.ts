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
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./MultiViewportApi"),
      import("!editor-file-loader!./MultiViewportApp?entry=true"),
      import("!editor-file-loader!./MultiViewportWidget"),
      import("!editor-file-loader!./MultiViewportFrontstageProvider"),
      import("!editor-file-loader!./MultiViewport.scss"),
    ],
    type: "MultiViewportApp.tsx",
  });
}
