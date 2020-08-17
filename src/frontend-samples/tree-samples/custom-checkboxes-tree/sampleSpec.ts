/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomCheckboxesTreeApp from "./CustomCheckboxesTreeApp";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomCheckboxesTreeApp.tsx", import: import("!!raw-loader!./CustomCheckboxesTreeApp"), entry: true },
    ],
    setup: CustomCheckboxesTreeApp.setup,
  });
}
