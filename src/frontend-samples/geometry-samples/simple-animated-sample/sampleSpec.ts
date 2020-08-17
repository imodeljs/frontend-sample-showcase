/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SimpleAnimated from "./SimpleAnimated";

export function getSimpleAnimatedSpec(): SampleSpec {
  return ({
    name: "simple-animated-sample",
    label: "Simple Animated",
    image: "heatmap-decorator-thumbnail.png",
    files: [
      { name: "SimpleAnimated.tsx", import: import("!!raw-loader!./SimpleAnimated"), entry: true },
    ],
    setup: SimpleAnimated.setup,
    teardown: SimpleAnimated.teardown,
  });
}
