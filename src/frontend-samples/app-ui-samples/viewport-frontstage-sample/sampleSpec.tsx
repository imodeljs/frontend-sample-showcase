
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ViewportFrontstageSample } from "./index";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "sample-frontstage",
    label: "Sample Frontstage",
    image: "favicon.png",
    customModelList: [],
    files: [
      { name: "ViewportFrontstageSample.tsx", import: import("!!raw-loader!./index") },
      { name: "SampleAppUiComponent.tsx", import: import("!!raw-loader!../common/SampleAppUiComponent") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
    ],
    setup: ViewportFrontstageSample.setup,
  });
}
