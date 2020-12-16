
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { ViewportFrontstageSample } from "./ViewportFrontstageApp";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-frontstage-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewportFrontstageApp.tsx", import: import("!!raw-loader!./ViewportFrontstageApp"), entry: true },
      { name: "ViewportFrontstageUi.tsx", import: import("!!raw-loader!../../../Components/frontstages/ViewportFrontstage") },
    ],
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    setup: ViewportFrontstageSample.setup.bind(ViewportFrontstageSample),
    teardown: ViewportFrontstageSample.teardown.bind(ViewportFrontstageSample),
  });
}
