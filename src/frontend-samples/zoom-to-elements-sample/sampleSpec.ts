/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ZoomToElementsApp.tsx", import: import("!!raw-loader!./ZoomToElementsApp") },
      { name: "ZoomToElementsUI.tsx", import: import("!!raw-loader!./ZoomToElementsUI"), entry: true },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    customModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    type: "ZoomToElementsUI.tsx",
  });
}
