/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getBasicTreeSpec(): SampleSpec {
  return ({
    name: "basic-tree-sample",
    label: "Basic Tree",
    image: "basic-tree-thumbnail.png",
    description: "#Tree #sample showing how to create a #simple tree using a #ControlledTree component.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./BasicTreeComponent"),
      import("!editor-file-loader!./BasicTreeApp?entry=true"),
      import("!editor-file-loader!./BasicTree.scss"),
    ],
    type: "BasicTreeApp.tsx",
  });
}
