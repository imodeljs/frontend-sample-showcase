/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import UnifiedSelectionTreeSample from "./UnifiedSelectionTree";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    files: [
      { name: "UnifiedSelectionTreeSample.tsx", import: import("!!raw-loader!./UnifiedSelectionTree"), entry: true },
    ],
    setup: UnifiedSelectionTreeSample.setup,
  });
}
