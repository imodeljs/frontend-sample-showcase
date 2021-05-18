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
    iModelList: [SampleIModels.ExtonCampus],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "SwipingComparisonApi.ts", import: import("!!raw-loader!./SwipingComparisonApi") },
      { name: "SwipingComparisonApp.tsx", import: import("!!raw-loader!./SwipingComparisonApp"), entry: true },
      { name: "SwipingComparisonWidget.tsx", import: import("!!raw-loader!./SwipingComparisonWidget") },
      { name: "Divider.tsx", import: import("!!raw-loader!./Divider") },
      { name: "Divider.scss", import: import("!!raw-loader!./Divider.scss") },
      { name: "SwipingComparison.scss", import: import("!!raw-loader!./SwipingComparison.scss") },
    ],
    type: "SwipingComparisonApp.tsx",
  });
}
