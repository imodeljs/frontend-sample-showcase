/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { getEmphasizeElementsSpec } from "frontend-samples/emphasize-elements-sample/sampleSpec";
import { getMarkerPinSpec } from "frontend-samples/marker-pin-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";

export function getPropertyValidationSpec(): SampleSpec {
  return ({
    name: "property-validation-sample",
    label: "Property Validation",
    image: "property-validation-thumbnail.png",
    description: "Uses the #Property Validation API to get the validation test results and visualize them in the view.",
    readme: async () => import("!!raw-loader!./readme.md"),
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getEmphasizeElementsSpec(),
        getMarkerPinSpec(),
      ],
    }),
    files: () => [
      import("!editor-file-loader!./PropertyValidationApi.ts"),
      import("!editor-file-loader!./PropertyValidationApp.tsx"),
      import("!editor-file-loader!./PropertyValidationClient.ts"),
      import("!editor-file-loader!./PropertyValidationWidget.tsx"),
      import("!editor-file-loader!./PropertyValidationTableWidget.tsx"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx"),
      import("!editor-file-loader!./PropertyValidationResultJson.ts"),
      import("!editor-file-loader!./PropertyValidationRuleJson.ts"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "PropertyValidationApp.tsx",
  });
}
