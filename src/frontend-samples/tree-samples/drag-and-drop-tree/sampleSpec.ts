/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import App from ".";

export function getDragAndDropTreeSpec(): SampleSpec {
  return ({
    name: "drag-and-drop",
    label: "Drag and Drop",
    image: "",
    customModelList: [],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "index.tsx", import: import("!!raw-loader!./index"), entry: true },
      { name: "DragAndDropTree.tsx", import: import("!!raw-loader!./DragAndDropTree") },
      { name: "SimpleTreeNode.tsx", import: import("!!raw-loader!./SimpleTreeNode") },
    ],
    sampleClass: App,
  });
}
