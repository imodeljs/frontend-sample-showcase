import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { UnifiedSelectionTree } from ".";

export function getUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "unified-selection-tree-sample",
    label: "Unified Selection Tree Sample",
    image: "custom-table-node-tree-thumbnail.png",
    files: [
      { name: "CustomNodeLoading.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: UnifiedSelectionTree.setup,
  });
}
