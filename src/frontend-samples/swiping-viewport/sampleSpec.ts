/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getSwipingComparisonSpec(): SampleSpec {
  return ({
    name: "swiping-viewport-sample",
    label: "Swiping Comparison",
    image: "swiping-viewport-thumbnail.png",
    description: "Compare models and reality data using a #clip and a #TileGraphicsProvider in a single #viewport.",
    readme: async () => import("!!raw-loader!./README.md"),
    iModelList: [SampleIModels.ExtonCampus],
    files: () => [
      { name: "SwipingComparisonApp.tsx", import: import("!!raw-loader!./SwipingComparisonApp") },
      { name: "SwipingComparisonUI.tsx", import: import("!!raw-loader!./SwipingComparisonUI"), entry: true },
      { name: "Divider.tsx", import: import("!!raw-loader!./Divider") },
      { name: "Divider.scss", import: import("!!raw-loader!./Divider.scss") },
    ],
    type: "SwipingComparisonUI.tsx",
  });
}
