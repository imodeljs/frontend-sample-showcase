import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { PresentationTreeSample } from ".";

export function getPresentationTreeSpec(): SampleSpec {
  return ({
    name: "presetation-tree-sample",
    label: "Presentation Tree",
    image: "custom-table-node-tree-thumbnail.png",
    files: [
      { name: "CustomNodeLoading.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: PresentationTreeSample.setup,
  });
}
