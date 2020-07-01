/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ViewClipApp from "./ViewClipApp";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    files: [
      { name: "ViewClipUI.tsx", import: import("!!raw-loader!./ViewClipUI") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: ViewClipApp.setup,
  });
}
