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
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CustomTableNodeTreeApp.tsx", import: import("!!raw-loader!./CustomTableNodeTreeApp") },
      { name: "CustomTableNodeTreeUI.tsx", import: import("!!raw-loader!./CustomTableNodeTreeUI"), entry: true },
      { name: "TableNodeTree.scss", import: import("!!raw-loader!./TableNodeTree.scss") },
    ],
    type: "CustomTableNodeTreeUI.tsx",
  });
}
