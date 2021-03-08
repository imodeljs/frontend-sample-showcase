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
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "UnifiedSelectionTreeUI.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeUI"), entry: true },
      { name: "UnifiedSelectionTreeApp.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeApp") },
    ],
    type: "UnifiedSelectionTreeUI",
  });
}
