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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "SimpleAnimatedApp.tsx", import: import("!!raw-loader!./SimpleAnimatedApp") },
      { name: "SimpleAnimatedUI.tsx", import: import("!!raw-loader!./SimpleAnimatedUI"), entry: true },
      { name: "ConwaysGameOfLife.ts", import: import("!!raw-loader!./ConwaysGameOfLife") },
    ],
    type: "SimpleAnimatedUI.tsx",
  });
}
