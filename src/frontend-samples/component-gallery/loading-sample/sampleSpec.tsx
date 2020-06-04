import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { LoadingList } from ".";

export function getLoadingSpec(): SampleSpec {
  return ({
    name: "loading-sample",
    label: "Loading",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "LoadingListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: LoadingList.setup,
  });
}
