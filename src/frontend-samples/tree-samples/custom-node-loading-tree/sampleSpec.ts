import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomNodeLoadingTreeSample } from "./CustomNodeLoadingTree";

export function getCustomNodeLoadingTreeSpec(): SampleSpec {
  return ({
    name: "custom-node-loading-sample",
    label: "Custom Node Loading Tree",
    image: "custom-node-loading-tree-thumbnail.png",
    files: [
      { name: "CustomNodeLoadingTreeSample.tsx", import: import("!!raw-loader!./CustomNodeLoadingTree") },
    ],
    setup: CustomNodeLoadingTreeSample.setup,
  });
}
