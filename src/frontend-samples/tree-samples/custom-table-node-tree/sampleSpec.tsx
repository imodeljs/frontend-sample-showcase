import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { TableNodeTreeSample } from ".";

export function getCustomTableNodeTreeSpec(): SampleSpec {
  return ({
    name: "custom-table-node-tree-sample",
    label: "Custom Table Node Tree",
    image: "custom-table-node-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomTableNodeTreeSample.tsx", import: import("!!raw-loader!./index") },
      { name: "Common.tsx", import: import("!!raw-loader!../Common") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
      { name: "TableNodeTree.scss", import: import("!!raw-loader!./TableNodeTree.scss") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
    ],
    setup: TableNodeTreeSample.setup,
  });
}
