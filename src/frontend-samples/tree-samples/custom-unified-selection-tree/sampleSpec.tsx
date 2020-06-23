import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomUnifiedSelectionTreeSample } from ".";

export function getCustomUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "custom-unified-selection-tree-sample",
    label: "Custom Unified Selection Tree",
    image: "custom-unified-selection-tree-thumbnail.png",
    files: [
      { name: "CustomUnifiedSelectionTreeSample.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomUnifiedSelectionTreeSample.setup,
  });
}
