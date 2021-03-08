/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import CrossProbingUI from "./CrossProbingUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getCrossProbingSpec(): SampleSpec {
  return ({
    name: "cross-probing-sample",
    label: "Cross-Probing",
    image: "cross-probing-thumbnail.png",
    customModelList: [SampleIModels.BayTown],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CrossProbingUI.tsx", import: import("!!raw-loader!./CrossProbingUI"), entry: true },
      { name: "CrossProbingApp.tsx", import: import("!!raw-loader!./CrossProbingApp") },
    ],
    sampleClass: CrossProbingUI,
    type: "CrossProbingUI",
  });
}
