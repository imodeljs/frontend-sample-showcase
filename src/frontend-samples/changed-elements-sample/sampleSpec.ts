/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getChangedElementsSpec(): SampleSpec {
  return ({
    name: "changed-elements-sample",
    label: "Changed Elements",
    image: "changedElements.png",
    description: "Compare #ChangedElements between #Version and colorizing them by operation.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ChangedElementsApp?entry=true"),
      import("!editor-file-loader!./ChangedElementsWidget"),
      import("!editor-file-loader!./ChangedElementsApi"),
    ],
    iModelList: [SampleIModels.Stadium],
    type: "ChangedElementsApp.tsx",
  });
}
