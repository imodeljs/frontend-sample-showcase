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
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./DragAndDropTreeComponent"),
      import("!editor-file-loader!./DragAndDropTreeProvider"),
      import("!editor-file-loader!./DragAndDropTreeApp?entry=true"),
      import("!editor-file-loader!./DragAndDropTreeApi"),
      import("!editor-file-loader!./DragAndDropTreeWidget"),
      import("!editor-file-loader!./BasicTreeNode"),
    ],
    type: "DragAndDropTreeApp.tsx",
  });
}
