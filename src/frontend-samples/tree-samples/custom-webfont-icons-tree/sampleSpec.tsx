import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomWebfontIconsTreeSample } from ".";

export function getCustomWebfontIconsTreeSpec(): SampleSpec {
  return ({
    name: "custom-webfont-icons-tree-sample",
    label: "Custom Webfont Icons Tree",
    image: "custom-table-node-tree-thumbnail.png",
    files: [
      { name: "CustomWebfontIconsTree.tsx", import: import("!!raw-loader!./index") },

      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomWebfontIconsTreeSample.setup,
  });
}