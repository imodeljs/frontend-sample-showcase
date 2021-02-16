/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { TableNodeTreeUI } from "./CustomTableNodeTreeUI";

export function getCustomTableNodeTreeSpec(): SampleSpec {
  return ({
    name: "custom-table-node-tree-sample",
    label: "Custom Table Node Tree",
    image: "custom-table-node-tree-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CustomTableNodeTreeUI.tsx", import: import("!!raw-loader!./CustomTableNodeTreeUI"), entry: true },
      { name: "CustomTableNodeTreeApp.tsx", import: import("!!raw-loader!./CustomTableNodeTreeApp") },
      { name: "TableNodeTree.scss", import: import("!!raw-loader!./TableNodeTree.scss") },
    ],
    sampleClass: TableNodeTreeUI,
  });
}
