import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { SplitButtonList } from ".";

export function getSplitButtonSpec(): SampleSpec {
  return ({
    name: "split-button-sample",
    label: "SplitButton",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "SplitButtonListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: SplitButtonList.setup
  });
}