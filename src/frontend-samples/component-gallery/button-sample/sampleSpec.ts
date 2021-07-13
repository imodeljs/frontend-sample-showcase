/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getButtonSpec(): SampleSpec {
  return ({
    name: "button-sample",
    label: "UI-Buttons",
    image: "ui-button-thumbnail.png",
    description: "#Component #sample showing different #styles of #buttons.",
    readme: async () => import("!!raw-loader!./readme.md"),
    iModelList: [],
    files: () => [
      import("!editor-file-loader!./Button?entry=true"),
    ],
    type: "Button.tsx",
  });
}
