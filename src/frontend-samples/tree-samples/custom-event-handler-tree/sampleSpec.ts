/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomEventHandlerTreeApp from "./CustomEventHandlerTreeApp";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    customModelList: [],
    files: [
      { name: "CustomEventHandlerTreeApp.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeApp"), entry: true },
      { name: "CustomEventHandlerTreeUI.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeUI"), entry: true },
    ],
    setup: CustomEventHandlerTreeApp.setup.bind(CustomEventHandlerTreeApp),
  });
}
