
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import BasicTreeSample from ".";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "BasicTreeSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: BasicTreeSample.setup,
  });
}
