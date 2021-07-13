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
    description: "#Tree #sample showing how to create two different trees, one that loads data from #memory, and the other using #presentation #rules.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CustomNodeLoadingTreeApp"),
      import("!editor-file-loader!./CustomNodeLoadingTreeUI?entry=true"),
    ],
    type: "CustomNodeLoadingTreeUI.tsx",
  });
}
