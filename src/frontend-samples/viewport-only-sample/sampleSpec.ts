/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "3d",
    image: "viewport-only-thumbnail.png",
    description: "#Basic #sample showing how to use the #iTwin #viewer component.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewportOnlyApp.tsx", import: import("!!raw-loader!./ViewportOnlyApp"), entry: true },
    ],
    type: "ViewportOnlyApp.tsx",
  });
}
