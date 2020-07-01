import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomEventHandlerTreeSample from "./CustomEventHandlerTree";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomEventHandlerTree.tsx", import: import("!!raw-loader!./CustomEventHandlerTree"), entry: true },
    ],
    setup: CustomEventHandlerTreeSample.setup,
  });
}
