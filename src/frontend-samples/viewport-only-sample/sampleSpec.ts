/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import walkthrough from "!walkthrough-loader!./walkthru.md";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "3d",
    image: "viewport-only-thumbnail.png",
    description: "#Basic #sample showing how to use the #iTwin #viewer component.",
    iTwinViewerReady: true,
    walkthrough,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewportOnlyApp.tsx", import: import("!editor-file-loader!./ViewportOnlyApp"), entry: true },
    ],
    type: "ViewportOnlyApp.tsx",
  });
}
