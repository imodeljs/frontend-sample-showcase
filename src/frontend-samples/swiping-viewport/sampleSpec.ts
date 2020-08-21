/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import SwipingComparisonApp from "./SwipingComparisonApp";

export function getSwipingComparisonSpec(): SampleSpec {
  return ({
    name: "swiping-viewport-sample",
    label: "Swiping Comparison",
    image: "viewport-only-thumbnail.png",
    // image: "swiping-viewport-thumbnail.png",
    files: [
      { name: "SwipingComparisonApp.tsx", import: import("!!raw-loader!./SwipingComparisonApp"), entry: true },
      { name: "SwipingComparisonUI.tsx", import: import("!!raw-loader!./SwipingComparisonUI") },
      { name: "Divider.tsx", import: import("!!raw-loader!./Divider") },
      { name: "Divider.scss", import: import("!!raw-loader!./Divider.scss") },
    ],
    setup: SwipingComparisonApp.setup,
    teardown: SwipingComparisonApp.teardown,
  });
}
