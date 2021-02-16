/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomCheckboxesTreeUI } from "./CustomCheckboxesTreeUI";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CustomCheckboxesTreeUI.tsx", import: import("!!raw-loader!./CustomCheckboxesTreeUI"), entry: true },
      { name: "CustomCheckboxesTreeApp.tsx", import: import("!!raw-loader!./CustomCheckboxesTreeApp") },
    ],
    sampleClass: CustomCheckboxesTreeUI,
  });
}
