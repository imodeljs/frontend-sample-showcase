
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { BasicTreeSample } from ".";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "BasicTreeSample.tsx", import: import("!!raw-loader!./index") },
      { name: "Common.tsx", import: import("!!raw-loader!../Common") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: BasicTreeSample.setup,
  });
}
