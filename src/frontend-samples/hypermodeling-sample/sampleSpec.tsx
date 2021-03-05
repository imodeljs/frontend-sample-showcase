/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import HyperModelingUI from "./HyperModelingUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getHyperModelingSpec(): SampleSpec {
  return ({
    name: "hypermodeling-sample",
    label: "Hyper-modeling",
    image: "hypermodeling-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "HyperModelingUI.tsx", import: import("!!raw-loader!./HyperModelingUI"), entry: true },
      { name: "HyperModelingApp.tsx", import: import("!!raw-loader!./HyperModelingApp") },
    ],
    customModelList: [SampleIModels.House],
    sampleClass: HyperModelingUI,
  });
}

