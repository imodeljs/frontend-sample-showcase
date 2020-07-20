/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import SwipingViewportApp from "./SwipingViewportApp";

export function getSwipingViewportSpec(): SampleSpec {
  return ({
    name: "swiping-viewport-sample",
    label: "Swiping Viewport",
    image: "viewport-only-thumbnail.png",
    // image: "swiping-viewport-thumbnail.png",
    files: [
      { name: "SwipingViewportApp.tsx", import: import("!!raw-loader!./SwipingViewportApp"), entry: true },
      { name: "SwipingViewportUI.tsx", import: import("!!raw-loader!./SwipingViewportUI") },
      { name: "Divider.tsx", import: import("!!raw-loader!./Divider") },
      { name: "Divider.scss", import: import("!!raw-loader!./Divider.scss") },
    ],
    // customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: SwipingViewportApp.setup,
    // teardown: ThematicDisplaySampleApp.teardown,
  });
}
