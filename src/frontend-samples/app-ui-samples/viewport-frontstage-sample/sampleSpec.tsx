
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../../Components/IModelSelector/IModelSelector";
import { ViewportFrontstageSample } from "./index";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-frontstage-thumbnail.png",
    files: [
      { name: "ViewportFrontstageSample.tsx", import: import("!!raw-loader!./index"), entry: true },
      { name: "ViewportFrontstage.tsx", import: import("!!raw-loader!../../../Components/frontstages/ViewportFrontstage")},
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: ViewportFrontstageSample.setup,
    teardown: ViewportFrontstageSample.teardown,
  });
}
