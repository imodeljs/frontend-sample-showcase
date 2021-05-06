/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimpleAnimatedSpec(): SampleSpec {
  return ({
    name: "simple-animated-sample",
    label: "Simple Animated",
    image: "simple-animated-thumbnail.png",
    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "SimpleAnimatedApi.ts", import: import("!!raw-loader!./SimpleAnimatedApi") },
      { name: "SimpleAnimatedApp.tsx", import: import("!!raw-loader!./SimpleAnimatedApp"), entry: true },
      { name: "ConwaysGameOfLife.ts", import: import("!!raw-loader!./ConwaysGameOfLife") },
      { name: "SimpleAnimatedWidget.tsx", import: import("!!raw-loader!./SimpleAnimatedWidget") },
      { name: "GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "SimpleAnimated.scss", import: import("!!raw-loader!./SimpleAnimated.scss") },
    ],
    type: "SimpleAnimatedApp.tsx",
  });
}
