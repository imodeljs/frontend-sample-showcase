/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import BasicTreeUI from "./BasicTreeUI";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "BasicTreeApp.tsx", import: import("!!raw-loader!./BasicTreeApp") },
      { name: "BasicTreeUI.tsx", import: import("!!raw-loader!./BasicTreeUI"), entry: true },
    ],
    sampleClass: BasicTreeUI,
  });
}
