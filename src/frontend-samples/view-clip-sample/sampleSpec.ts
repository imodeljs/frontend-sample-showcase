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
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewClipApp.tsx", import: import("!!raw-loader!./ViewClipApp"), entry: true },
      { name: "ViewClipUI.tsx", import: import("!!raw-loader!./ViewClipUI") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: ViewClipApp.setup.bind(ViewClipApp),
  });
}
