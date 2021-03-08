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
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CustomCheckboxesTreeUI.tsx", import: import("!!raw-loader!./CustomCheckboxesTreeUI"), entry: true },
      { name: "CustomCheckboxesTreeApp.tsx", import: import("!!raw-loader!./CustomCheckboxesTreeApp") },
    ],
    type: "CustomCheckboxesTreeUI",
  });
}
