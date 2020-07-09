
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../../Components/IModelSelector/IModelSelector";
import { ViewportFrontstageSample } from "./ViewportFrontstageApp";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-frontstage-thumbnail.png",
    files: [
      { name: "ViewportFrontstageApp.tsx", import: import("!!raw-loader!./ViewportFrontstageApp"), entry: true },
      { name: "ViewportFrontstageUi.tsx", import: import("!!raw-loader!../../../Components/frontstages/ViewportFrontstage")},
    ],
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House],
    setup: ViewportFrontstageSample.setup,
    teardown: ViewportFrontstageSample.teardown,
  });
}
