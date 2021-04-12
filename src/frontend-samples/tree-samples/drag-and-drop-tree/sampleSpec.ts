/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";

export function getDragAndDropTreeSpec(): SampleSpec {
  return ({
    name: "drag-and-drop",
    label: "Drag and Drop",
    image: "",
    customModelList: [],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "index.tsx", import: import("!!raw-loader!./index"), entry: true },
      { name: "DragAndDropTree.tsx", import: import("!!raw-loader!./DragAndDropTree") },
      { name: "BasicTreeNode.tsx", import: import("!!raw-loader!./BasicTreeNode") },
    ],
    type: "index.tsx",
  });
}
