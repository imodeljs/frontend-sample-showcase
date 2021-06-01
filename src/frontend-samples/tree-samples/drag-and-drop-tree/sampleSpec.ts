/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";

export function getDragAndDropTreeSpec(): SampleSpec {
  return ({
    name: "drag-and-drop",
    label: "Drag and Drop",
    image: "drag-and-drop-tree-thumbnail.png",
    iModelList: [],
    readme: async () => import("-!raw-loader!./README.md"),
    files: () => [
      { name: "DragAndDropTreeApp.tsx", import: import("-!raw-loader!./DragAndDropTreeApp") },
      { name: "DragAndDropTreeUI.tsx", import: import("-!raw-loader!./DragAndDropTreeUI"), entry: true },
      { name: "BasicTreeNode.tsx", import: import("-!raw-loader!./BasicTreeNode") },
    ],
    type: "DragAndDropTreeUI.tsx",
  });
}
