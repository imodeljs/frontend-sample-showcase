import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { UnifiedSelectionTree } from "./UnifiedSelectionTree";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    files: [
      { name: "UnifiedSelectionTreeSample.tsx", import: import("!!raw-loader!./UnifiedSelectionTree") },
    ],
    setup: UnifiedSelectionTree.setup,
  });
}
