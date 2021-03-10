/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCustomWebfontIconsTreeSpec(): SampleSpec {
  return ({
    name: "custom-webfont-icons-tree-sample",
    label: "Custom Webfont Icons Tree",
    image: "custom-webfont-icons-tree-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CustomWebfontIconsTreeApp.tsx", import: import("!!raw-loader!./CustomWebfontIconsTreeApp") },
      { name: "CustomWebfontIconsTreeUI.tsx", import: import("!!raw-loader!./CustomWebfontIconsTreeUI"), entry: true },
    ],
    type: "CustomWebfontIconsTreeUI.tsx",
  });
}
