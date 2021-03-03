
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ViewportFrontstageSample from "./ViewportFrontstageApp";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-frontstage-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewportFrontstageSample.tsx", import: import("!!raw-loader!../../../Components/frontstages/ViewportFrontstage"), entry: true },
    ],
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: ViewportFrontstageSample,
  });
}
