/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import ViewerOnly2dUI from "./ViewerOnly2dUI";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewerOnly2dApp.tsx", import: import("!!raw-loader!./ViewerOnly2dApp"), entry: true },
      { name: "ViewerOnly2dUI.tsx", import: import("!!raw-loader!./ViewerOnly2dUI") },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
    ],
    customModelList: [SampleIModels.House, SampleIModels.MetroStation],
    setup: ViewerOnly2dUI,
  });
}
