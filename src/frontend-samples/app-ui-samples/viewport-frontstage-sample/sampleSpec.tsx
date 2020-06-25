
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ViewportFrontstageSample } from "./index";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage",
    label: "Viewport Frontstage",
    image: "viewport-only-thumbnail.png",
    customModelList: [],
    files: [
      { name: "ViewportFrontstageSample.tsx", import: import("!!raw-loader!./index") },
      { name: "SampleAppUiComponent.tsx", import: import("!!raw-loader!../common/SampleAppUiComponent") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
    ],
    setup: ViewportFrontstageSample.setup,
    teardown: ViewportFrontstageSample.teardown,
  });
}
