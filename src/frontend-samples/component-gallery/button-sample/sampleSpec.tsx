import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ButtonList } from ".";

export function getButtonSpec(): SampleSpec {
  return ({
    name: "button-sample",
    label: "UI-Buttons",
    image: "ui-button-thumbnail.png",
    customModelList: [],
    files: [
      { name: "ButtonSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: ButtonList.setup,
  });
}