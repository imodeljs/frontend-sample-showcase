/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    description: "#Tree #sample showing how to use #events that interact with a #viewport using #useUnifiedSelectionTreeEventHandler.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "UnifiedSelectionTreeWidget.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeWidget") },
      { name: "UnifiedSelectionTreeApp.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeApp"), entry: true },
      { name: "TreeHierarchy.ts", import: import("!!raw-loader!./TreeHierarchy.ts") },
      { name: "UnifiedSelectionTree.scss", import: import("!!raw-loader!./UnifiedSelectionTree.scss") },
    ],
    type: "UnifiedSelectionTreeApp.tsx",
  });
}
