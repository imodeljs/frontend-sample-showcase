import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomEventHandlerTreeSample from "./CustomEventHandlerTree";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomEventHandlerTree.tsx", import: import("!!raw-loader!./CustomEventHandlerTree") },
      { name: "Common.ts", import: import("!!raw-loader!../Common") },
      { name: "Trees.scss", import: import("!!raw-loader!../Trees.scss") },
    ],
    setup: CustomEventHandlerTreeSample.setup,
  });
}
