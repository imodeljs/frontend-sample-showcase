/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getInputsSpec(): SampleSpec {
  return ({
    name: "inputs-sample",
    label: "UI-Inputs",
    image: "ui-inputs-thumbnail.png",
    description: "#Component #sample showing different #styles of #inputs.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./Inputs?entry=true"),
      import("!editor-file-loader!./SampleImageCheckBox"),
    ],
    type: "Inputs.tsx",
  });
}
