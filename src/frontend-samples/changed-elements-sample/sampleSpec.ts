/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getChangedElementsSpec(): SampleSpec {
  return ({
    name: "changed-elements-sample",
    label: "Changed Elements",
    image: "changedElements.png",
    description: "Compare #ChangedElements between #Version and colorizing them by operation.",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ChangedElementsApp?entry=true"),
      import("!editor-file-loader!./ChangedElementsWidget"),
      import("!editor-file-loader!./ChangedElementsApi"),
      import("!editor-file-loader!./ChangedElementsClient"),
      import("!editor-file-loader!./ChangedElements.scss"),
    ],
    iModelList: [SampleIModels.Stadium],
    type: "ChangedElementsApp.tsx",
  });
}
