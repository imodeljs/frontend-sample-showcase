import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomEventHandlerTreeSample from ".";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomEventHandlerTreeSample.tsx", import: import("!!raw-loader!./index") },
      { name: "Common.tsx", import: import("!!raw-loader!../Common") },
      { name: "index.scss", import: import("!!raw-loader!../index.scss") },
    ],
    setup: CustomEventHandlerTreeSample.setup,
  });
}
