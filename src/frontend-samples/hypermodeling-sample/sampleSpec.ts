/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getHyperModelingSpec(): SampleSpec {
  return ({
    name: "hypermodeling-sample",
    label: "Hyper-modeling",
    image: "hypermodeling-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "HyperModelingUI.tsx", import: import("!!raw-loader!./HyperModelingUI"), entry: true },
      { name: "HyperModelingApp.tsx", import: import("!!raw-loader!./HyperModelingApp") },
    ],
    customModelList: [SampleIModels.House],
    type: "HyperModelingUI.tsx"
  });
}
