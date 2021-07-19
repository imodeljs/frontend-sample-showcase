/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { getEmphasizeElementsSpec } from "frontend-samples/emphasize-elements-sample/sampleSpec";
import { getMarkerPinSpec } from "frontend-samples/marker-pin-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";

export function getValidationSpec(): SampleSpec {
  return ({
    name: "validation-sample",
    label: "Validation",
    image: "validation-thumbnail.png",
    description: "Uses the #validation REST api.",
    readme: async () => import("!!raw-loader!./readme.md"),
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getEmphasizeElementsSpec(),
        getMarkerPinSpec(),
      ],
    }),
    files: () => [
      import("!editor-file-loader!./ValidationApi.ts"),
      import("!editor-file-loader!./ValidationApp.tsx"),
      import("!editor-file-loader!./ValidationClient.ts"),
      import("!editor-file-loader!./ValidationWidget.tsx"),
      import("!editor-file-loader!./ValidationTableWidget.tsx"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx"),
      import("!editor-file-loader!./ValidationResultJson.ts"),
      import("!editor-file-loader!./ValidationRuleJson.ts"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ValidationApp.tsx",
  });
}
