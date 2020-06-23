import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { UnifiedSelectionTree } from ".";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree",
    image: "unified-selection-tree-thumbnail.png",
    files: [
      { name: "UnifiedSelectionTreeSample.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: UnifiedSelectionTree.setup,
  });
}
