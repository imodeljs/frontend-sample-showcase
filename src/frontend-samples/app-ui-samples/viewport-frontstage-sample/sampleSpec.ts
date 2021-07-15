
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-frontstage-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ViewportFrontstageApp?entry=true"),
    ],
    iModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    type: "ViewportFrontstageApp.tsx",
  });
}
