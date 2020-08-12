/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SmallConvexHull from "./SmallConvexHull";

export function getSmallConvexHullSpec(): SampleSpec {
  return ({
    name: "small-convex-hull-sample",
    label: "Small Convex Hull",
    image: "heatmap-decorator-thumbnail.png",
    files: [
      { name: "SmallConvexHull.tsx", import: import("!!raw-loader!./SmallConvexHull"), entry: true },
    ],
    setup: SmallConvexHull.setup,
    teardown: SmallConvexHull.teardown,
  });
}
