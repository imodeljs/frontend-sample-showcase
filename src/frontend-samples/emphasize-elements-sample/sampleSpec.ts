/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { getViewportOnlySpec } from "frontend-samples/viewport-only-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    description: "How to #emphasize, #hide, #isolate, and #override the #color of elements using the #EmphasizeElements API.",
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getViewportOnlySpec(),
      ],
    }),
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./EmphasizeElementsApi"),
      import("!editor-file-loader!./EmphasizeElementsApp?entry=true"),
      import("!editor-file-loader!./EmphasizeElementsWidget"),
      import("!editor-file-loader!./EmphasizeElements.scss"),
    ],
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    type: "EmphasizeElementsApp.tsx",
  });
}
