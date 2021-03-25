/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCustomNodeLoadingTreeSpec(): SampleSpec {
  return ({
    name: "custom-node-loading-sample",
    label: "Custom Node Loading Tree",
    image: "custom-node-loading-tree-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CustomNodeLoadingTreeApp.tsx", import: import("!!raw-loader!./CustomNodeLoadingTreeApp") },
      { name: "CustomNodeLoadingTreeUI.tsx", import: import("!!raw-loader!./CustomNodeLoadingTreeUI"), entry: true },
    ],
    type: "CustomNodeLoadingTreeUI.tsx",
  });
}
