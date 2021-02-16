/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { BasicTreeUI } from "./BasicTreeUI";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "BasicTreeUI.tsx", import: import("!!raw-loader!./BasicTreeUI"), entry: true },
      { name: "BasicTreeApp.tsx", import: import("!!raw-loader!./BasicTreeApp") },
    ],
    sampleClass: BasicTreeUI,
  });
}
