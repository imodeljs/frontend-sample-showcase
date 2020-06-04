import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { EmphasizeElementsApp } from ".";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    files: [
      { name: "EmphasizeElementsSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: EmphasizeElementsApp.setup,
    teardown: EmphasizeElementsApp.teardown,
  });
}