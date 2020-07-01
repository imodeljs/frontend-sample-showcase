
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import BasicTreeSample from "./BasicTree";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "BasicTree.tsx", import: import("!!raw-loader!./BasicTree"), entry: true },
    ],
    setup: BasicTreeSample.setup,
  });
}
