
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { BasicFrontstageSample } from "./index";

export function getBasicFrontstageSample(): SampleSpec {
  return ({
    name: "sample-frontstage",
    label: "Sample Frontstage",
    image: "favicon.png",
    customModelList: [],
    files: [
      { name: "BasicFrontstageSample.tsx", import: import("!!raw-loader!./index") },
      { name: "SampleAppUiComponent.tsx", import: import("!!raw-loader!../common/SampleAppUiComponent") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
    ],
    setup: BasicFrontstageSample.setup,
  });
}
