/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "BasicTreeUI.tsx", import: import("!!raw-loader!./BasicTreeUI"), entry: true },
      { name: "BasicTreeApp.tsx", import: import("!!raw-loader!./BasicTreeApp") },
    ],
    type: "BasicTreeUI.tsx",
  });
}
