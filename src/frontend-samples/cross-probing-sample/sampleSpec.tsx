/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import CrossProbingUI from "./CrossProbingUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getCrossProbingSpec(): SampleMetadata {
  return ({
    name: "cross-probing-sample",
    label: "Cross-Probing",
    image: "cross-probing-thumbnail.png",
    modelList: [SampleIModels.BayTown],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CrossProbingApp.tsx", import: import("!!raw-loader!./CrossProbingApp") },
      { name: "CrossProbingUI.tsx", import: import("!!raw-loader!./CrossProbingUI"), entry: true },
    ],
    sampleClass: CrossProbingUI,
  });
}
