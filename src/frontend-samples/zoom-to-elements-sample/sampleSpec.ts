/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ZoomToElementsApi.ts", import: import("!!raw-loader!./ZoomToElementsApi") },
      { name: "ZoomToElementsApp.tsx", import: import("!!raw-loader!./ZoomToElementsApp"), entry: true },
      { name: "ZoomToElementsWidget.tsx", import: import("!!raw-loader!./ZoomToElementsWidget") },
      { name: "ZoomToElements.scss", import: import("!!raw-loader!./ZoomToElements.scss") },
    ],
    iModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    type: "ZoomToElementsApp.tsx",
  });
}
