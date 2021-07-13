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
      import("!editor-file-loader!./UnifiedSelectionTreeWidget"),
      import("!editor-file-loader!./UnifiedSelectionTreeApp?entry=true"),
      import("!editor-file-loader!./TreeHierarchy.ts"),
      import("!editor-file-loader!./UnifiedSelectionTree.scss"),
    ],
    type: "UnifiedSelectionTreeApp.tsx",
  });
}
