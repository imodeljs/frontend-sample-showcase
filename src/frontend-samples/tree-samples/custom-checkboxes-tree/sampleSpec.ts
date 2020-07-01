import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomCheckboxesTreeSample from "./CustomCheckboxesTree";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomCheckboxesTree.tsx", import: import("!!raw-loader!./CustomCheckboxesTree"), entry: true },
    ],
    setup: CustomCheckboxesTreeSample.setup,
  });
}
