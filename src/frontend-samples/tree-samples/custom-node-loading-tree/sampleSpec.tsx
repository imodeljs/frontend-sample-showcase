import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomNodeLoadingTreeSample } from ".";

export function getCustomNodeLoadingTreeSpec(): SampleSpec {
  return ({
    name: "custom-node-loading-sample",
    label: "Custom Node Loading",
    image: "custom-table-node-tree-thumbnail.png",
    files: [
      { name: "CustomNodeLoading.tsx", import: import("!!raw-loader!.") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomNodeLoadingTreeSample.setup,
  });
}
