/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomCheckboxesTreeSample from ".";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomCheckboxesTreeSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: CustomCheckboxesTreeSample.setup,
  });
}
