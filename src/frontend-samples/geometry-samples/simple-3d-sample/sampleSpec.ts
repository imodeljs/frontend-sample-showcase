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
    description: "#Geometry #sample showing how to generate #simple types of #3d geometry.",
    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Simple3dApi.tsx", import: import("!!raw-loader!./Simple3dApi") },
      { name: "Simple3dApp.tsx", import: import("!!raw-loader!./Simple3dApp"), entry: true },
      { name: "Simple3dWidget.tsx", import: import("!!raw-loader!./Simple3dWidget") },
      { name: "GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "Simple3d.scss", import: import("!!raw-loader!./Simple3d.scss") },
    ],
    type: "Simple3dApp.tsx",
  });
}
