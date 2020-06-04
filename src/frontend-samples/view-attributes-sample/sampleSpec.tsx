import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { ViewAttributesApp } from ".";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    files: [
      { name: "ViewAttributesSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: ViewAttributesApp.setup,
    teardown: ViewAttributesApp.teardown,
  });
}
