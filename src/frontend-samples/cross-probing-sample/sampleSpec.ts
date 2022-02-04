/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getCrossProbingSpec(): SampleSpec {
  return ({
    name: "cross-probing-sample",
    label: "Cross-Probing",
    image: "cross-probing-thumbnail.png",
    iModelList: [SampleIModels.BayTown],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CrossProbingApi"),
      import("!editor-file-loader!./CrossProbingApp?entry=true"),
      import("!editor-file-loader!./CrossProbingFrontstageProvider"),
    ],
    type: "CrossProbingApp.tsx",
  });
}
