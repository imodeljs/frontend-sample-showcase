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
    description: "#Geometry #sample showing how to generate several #3d pieces of geometry including #mitered #pipes, #rotational, #linear, and #ruled, #sweeps.",
    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Advanced3dApi.ts", import: import("!!raw-loader!./Advanced3dApi") },
      { name: "Advanced3dApp.tsx", import: import("!!raw-loader!./Advanced3dApp"), entry: true },
      { name: "Advanced3dWidget.tsx", import: import("!!raw-loader!./Advanced3dWidget") },
      { name: "GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "Advanced3d.scss", import: import("!!raw-loader!./Advanced3d.scss") },
    ],
    type: "Advanced3dApp.tsx",
  });
}
