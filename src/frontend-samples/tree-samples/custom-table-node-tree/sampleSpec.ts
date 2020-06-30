import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TableNodeTreeSample from "./CustomTableNodeTree";

export function getCustomTableNodeTreeSpec(): SampleSpec {
  return ({
    name: "custom-table-node-tree-sample",
    label: "Custom Table Node Tree",
    image: "custom-table-node-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomTableNodeTree.tsx", import: import("!!raw-loader!./CustomTableNodeTree") },
      { name: "Trees.scss", import: import("!!raw-loader!../Trees.scss") },
      { name: "TableNodeTree.scss", import: import("!!raw-loader!./TableNodeTree.scss") },
    ],
    setup: TableNodeTreeSample.setup,
  });
}
