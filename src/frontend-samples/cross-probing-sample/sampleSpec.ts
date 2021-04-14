/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getCrossProbingSpec(): SampleSpec {
  return ({
    name: "cross-probing-sample",
    label: "Cross-Probing",
    image: "cross-probing-thumbnail.png",
    iModelList: [SampleIModels.BayTown],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CrossProbingUI.tsx", import: import("!!raw-loader!./CrossProbingUI"), entry: true },
      { name: "CrossProbingApp.tsx", import: import("!!raw-loader!./CrossProbingApp") },
    ],
    type: "CrossProbingUI.tsx",
  });
}
