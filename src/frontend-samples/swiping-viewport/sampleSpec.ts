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
      import("!editor-file-loader!./SwipingComparisonApp"),
      import("!editor-file-loader!./SwipingComparisonUI?entry=true"),
      import("!editor-file-loader!./Divider"),
      import("!editor-file-loader!./Divider.scss"),
    ],
    type: "SwipingComparisonUI.tsx",
  });
}
