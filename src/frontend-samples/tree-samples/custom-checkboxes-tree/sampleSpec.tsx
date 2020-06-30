import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomCheckboxesTreeSample from ".";

export function getCustomCheckboxesTreeSpec(): SampleSpec {
  return ({
    name: "custom-checkboxes-sample",
    label: "Custom Checkboxes Tree",
    image: "custom-checkboxes-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomCheckboxesTreeSample.tsx", import: import("!!raw-loader!./index") },
      { name: "Common.tsx", import: import("!!raw-loader!../Common") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomCheckboxesTreeSample.setup,
  });
}
