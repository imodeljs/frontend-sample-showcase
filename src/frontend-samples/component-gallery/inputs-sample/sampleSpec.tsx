import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { InputsList } from ".";

export function getInputsSpec(): SampleSpec {
  return ({
    name: "inputs-sample",
    label: "Inputs",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "InputsListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "SampleImageCheckBox.tsx", import: import("!!raw-loader!./SampleImageCheckBox") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: InputsList.setup,
  });
}