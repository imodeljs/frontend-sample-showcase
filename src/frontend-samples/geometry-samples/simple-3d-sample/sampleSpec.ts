/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimple3dSpec(): SampleSpec {
  return ({
    name: "simple-3d-sample",
    label: "Simple 3d",
    image: "simple-3d-thumbnail.png",
    modelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Simple3dApp.tsx", import: import("!!raw-loader!./Simple3dApp") },
      { name: "Simple3dUI.tsx", import: import("!!raw-loader!./Simple3dUI"), entry: true },
    ],
    type: "Simple3dUI.tsx",
  });
}
