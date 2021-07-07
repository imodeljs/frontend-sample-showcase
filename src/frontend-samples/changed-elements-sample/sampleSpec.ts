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
      { name: "ChangedElementsApp.tsx", import: import("!!raw-loader!./ChangedElementsApp.tsx") },
      { name: "ChangedElementsWidget.tsx", import: import("!!raw-loader!./ChangedElementsWidget.tsx") },
      { name: "ChangedElementsApi.ts", import: import("!!raw-loader!./ChangedElementsApi.ts"), entry: true },
    ],
    iModelList: [SampleIModels.Stadium],
    type: "ChangedElementsApp.tsx",
  });
}
