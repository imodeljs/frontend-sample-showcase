/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import UnifiedSelectionTreeApp from "./UnifiedSelectionTreeApp";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    files: [
      { name: "UnifiedSelectionTreeApp.tsx", import: import("!!raw-loader!./UnifiedSelectionTreeApp"), entry: true },
    ],
    setup: UnifiedSelectionTreeApp.setup.bind(UnifiedSelectionTreeApp),
  });
}
