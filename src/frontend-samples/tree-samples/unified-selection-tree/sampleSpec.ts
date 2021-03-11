/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import UnifiedSelectionTreeUI from "./UnifiedSelectionTreeUI";

export function getUnifiedSelectionTreeSpec(): SampleMetadata {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "UnifiedSelectionTreeApp.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeApp") },
      { name: "UnifiedSelectionTreeUI.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeUI"), entry: true },
    ],
    sampleClass: UnifiedSelectionTreeUI,
  });
}
