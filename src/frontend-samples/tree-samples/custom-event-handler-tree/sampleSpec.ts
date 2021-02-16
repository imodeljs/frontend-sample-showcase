/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomEventHandlerTreeUI } from "./CustomEventHandlerTreeUI";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CustomEventHandlerTreeUI.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeUI"), entry: true },
      { name: "CustomEventHandlerTreeApp.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeApp") },
    ],
    sampleClass: CustomEventHandlerTreeUI,
  });
}
