/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    description: "#Tree #sample showing how to create a tree with custom #checkboxes using a #ImageCheckBox component.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CustomCheckboxesTreeComponent"),
      import("!editor-file-loader!./CustomCheckboxesTreeApp?entry=true"),
      import("!editor-file-loader!./CustomCheckboxesTree.scss"),
    ],
    type: "CustomCheckboxesTreeApp.tsx",
  });
}
