/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SimpleAnimatedUI from "./SimpleAnimatedUI";

export function getSimpleAnimatedSpec(): SampleSpec {
  return ({
    name: "simple-animated-sample",
    label: "Simple Animated",
    image: "simple-animated-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "SimpleAnimatedUI.tsx", import: import("!!raw-loader!./SimpleAnimatedUI"), entry: true },
      { name: "SimpleAnimatedApp.tsx", import: import("!!raw-loader!./SimpleAnimatedApp") },
      { name: "ConwaysGameOfLife.ts", import: import("!!raw-loader!./ConwaysGameOfLife") },
    ],
    sampleClass: SimpleAnimatedUI,
  });
}
