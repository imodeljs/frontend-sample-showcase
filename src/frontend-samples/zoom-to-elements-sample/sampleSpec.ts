/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ZoomToElementsApp from "./ZoomToElementsApp";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    files: [
      { name: "ZoomToElementsApp.tsx", import: import("!!raw-loader!./ZoomToElementsApp"), entry: true },
      { name: "ZoomToElementsUI.tsx", import: import("!!raw-loader!./ZoomToElementsUI") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    customModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    setup: ZoomToElementsApp.setup.bind(ZoomToElementsApp),
  });
}
