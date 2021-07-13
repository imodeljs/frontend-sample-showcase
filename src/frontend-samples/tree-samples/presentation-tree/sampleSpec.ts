/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getPresentationTreeSpec(): SampleSpec {
  return ({
    name: "presetation-tree-sample",
    label: "Presentation Tree",
    image: "presentation-tree-thumbnail.png",
    description: "#Tree #sample showing how to load data using #presentation #rules.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./PresentationTreeApp"),
      import("!editor-file-loader!./PresentationTreeUI?entry=true"),
    ],
    type: "PresentationTreeUI.tsx",
  });
}
