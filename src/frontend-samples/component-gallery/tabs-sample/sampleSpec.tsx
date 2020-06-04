import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { TabsList } from ".";

export function getTabsSpec(): SampleSpec {
  return ({
    name: "tabs-sample",
    label: "Tabs",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "TabsListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: TabsList.setup
  });
}