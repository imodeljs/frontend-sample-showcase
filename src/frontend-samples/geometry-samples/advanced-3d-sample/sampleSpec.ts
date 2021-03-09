/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getAdvanced3dSpec(): SampleSpec {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Advanced3dUI.tsx", import: import("!!raw-loader!./Advanced3dUI"), entry: true },
      { name: "Advanced3dApp.tsx", import: import("!!raw-loader!./Advanced3dApp") },

    ],
    type: "Advanced3dUI.tsx",
  });
}
