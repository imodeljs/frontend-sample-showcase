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
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CustomEventHandlerTreeApp.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeApp") },
      { name: "CustomEventHandlerTreeUI.tsx", import: import("!!raw-loader!./CustomEventHandlerTreeUI"), entry: true },
    ],
    type: "CustomEventHandlerTreeUI.tsx",
  });
}
