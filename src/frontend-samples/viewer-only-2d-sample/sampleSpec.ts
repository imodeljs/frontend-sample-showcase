/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ViewerOnly2dApp from "./ViewerOnly2dApp";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    files: [
      { name: "ViewerOnly2dApp.tsx", import: import("!!raw-loader!./ViewerOnly2dApp"), entry: true },
      { name: "ViewerOnly2dUI.tsx", import: import("!!raw-loader!./ViewerOnly2dUI") },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
    ],
    customModelList: [SampleIModels.House],
    setup: ViewerOnly2dApp.setup,
  });
}
