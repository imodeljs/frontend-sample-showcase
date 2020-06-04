import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ExpandableListList } from ".";

export function getExpandableListSpec(): SampleSpec {
  return ({
    name: "expandable-list-sample",
    label: "ExpandableList",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ExpandableListListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "SampleExpandableBlock.tsx", import: import("!!raw-loader!./SampleExpandableBlock") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: ExpandableListList.setup,
  });
}