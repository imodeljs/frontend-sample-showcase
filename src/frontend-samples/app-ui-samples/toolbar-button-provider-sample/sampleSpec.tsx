
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ToolbarButtonSample } from "./index";

export function getToolbarButtonSample(): SampleSpec {
  return ({
    name: "toolbar-button-sample",
    label: "Add Toolbar Button",
    image: "viewport-only-thumbnail.png",
    customModelList: [],
    files: [
      { name: "ToolbarButtonSample.tsx", import: import("!!raw-loader!./index") },
      { name: "ToolbarButtonProvider.tsx", import: import("!!raw-loader!./ToolbarButtonProvider") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
    ],
    setup: ToolbarButtonSample.setup,
  });
}
