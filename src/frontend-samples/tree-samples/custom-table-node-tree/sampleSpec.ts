/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCustomTableNodeTreeSpec(): SampleSpec {
  return ({
    name: "custom-table-node-tree-sample",
    label: "Custom Table Node Tree",
    image: "custom-table-node-tree-thumbnail.png",
    description: "#Tree #sample showing how to override the default #node #rendering of a tree.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CustomTableNodeTreeApp"),
      import("!editor-file-loader!./CustomTableNodeTreeUI?entry=true"),
      import("!editor-file-loader!./TableNodeTree.scss"),
    ],
    type: "CustomTableNodeTreeUI.tsx",
  });
}
