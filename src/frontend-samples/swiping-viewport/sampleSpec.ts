/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import SwipingComparisonApp from "./SwipingComparisonApp";

export function getSwipingComparisonSpec(): SampleSpec {
  return ({
    name: "swiping-viewport-sample",
    label: "Swiping Comparison",
    image: "swiping-viewport-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    customModelList: [SampleIModels.ExtonCampus],
    files: [
      { name: "SwipingComparisonApp.tsx", import: import("!!raw-loader!./SwipingComparisonApp"), entry: true },
      { name: "SwipingComparisonUI.tsx", import: import("!!raw-loader!./SwipingComparisonUI") },
      { name: "Divider.tsx", import: import("!!raw-loader!./Divider") },
      { name: "Divider.scss", import: import("!!raw-loader!./Divider.scss") },
    ],
    setup: SwipingComparisonApp.setup.bind(SwipingComparisonApp),
    teardown: SwipingComparisonApp.teardown.bind(SwipingComparisonApp),
  });
}
