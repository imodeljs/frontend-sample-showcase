import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomUnifiedSelectionTreeSample } from ".";

export function getCustomUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "custom-unified-selection-tree-sample",
    label: "Custom Unified Selection Tree Sample",
    image: "custom-table-node-tree-thumbnail.png",
    files: [
      { name: "CustomNodeLoading.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomUnifiedSelectionTreeSample.setup,
  });
}
