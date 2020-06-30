import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomCheckboxesTreeSample from "./CustomCheckboxesTree";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomCheckboxesTree.tsx", import: import("!!raw-loader!./CustomCheckboxesTree") },
      { name: "Common.ts", import: import("!!raw-loader!../Common") },
      { name: "Trees.scss", import: import("!!raw-loader!../Trees.scss") },
    ],
    setup: CustomCheckboxesTreeSample.setup,
  });
}
