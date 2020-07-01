/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TableNodeTreeSample from ".";

export function getCustomTableNodeTreeSpec(): SampleSpec {
  return ({
    name: "custom-table-node-tree-sample",
    label: "Custom Table Node Tree",
    image: "custom-table-node-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomTableNodeTree.tsx", import: import("!!raw-loader!./index"), entry: true },
      { name: "TableNodeTree.scss", import: import("!!raw-loader!./TableNodeTree.scss") },
    ],
    setup: TableNodeTreeSample.setup,
  });
}
