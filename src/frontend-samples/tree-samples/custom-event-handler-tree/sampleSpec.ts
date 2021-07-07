/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCustomEventHandlerTreeSpec(): SampleSpec {
  return ({
    name: "custom-event-handler-tree-sample",
    label: "Custom Event Handler Tree",
    image: "custom-event-handler-tree-thumbnail.png",
    description: "#Tree #sample showing how to create a tree with custom #events using a #TreeEventHandler.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CustomEventHandlerTreeApp"),
      import("!editor-file-loader!./CustomEventHandlerTreeUI?entry=true"),
    ],
    type: "CustomEventHandlerTreeUI.tsx",
  });
}
