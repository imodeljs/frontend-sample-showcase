/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import CrossProbingUI from "./CrossProbingUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getCrossProbingSpec(): SampleSpec {
  return ({
    name: "cross-probing-sample",
    label: "Cross-Probing",
    image: "cross-probing-thumbnail.png",
    customModelList: [SampleIModels.BayTown],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CrossProbingApp.tsx", import: import("!!raw-loader!./CrossProbingApp") },
      { name: "CrossProbingUI.tsx", import: import("!!raw-loader!./CrossProbingUI"), entry: true },
    ],
    sampleClass: CrossProbingUI,
  });
}
