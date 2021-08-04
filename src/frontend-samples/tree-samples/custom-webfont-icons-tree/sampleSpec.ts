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
    description: "#Tree #sample showing how to display #custom #icons using #iModel #data.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CustomWebfontIconsTreeComponent"),
      import("!editor-file-loader!./CustomWebfontIconsRuleset"),
      import("!editor-file-loader!./CustomWebfontIconsTreeApp?entry=true"),
      import("!editor-file-loader!./CustomWebfontIconsTree.scss"),
    ],
    type: "CustomWebfontIconsTreeApp.tsx",
  });
}
