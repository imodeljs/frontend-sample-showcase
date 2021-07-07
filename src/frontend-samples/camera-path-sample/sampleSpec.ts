/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getViewCameraSpec(): SampleSpec {
  return ({
    name: "Camera Path Sample",
    label: "Camera Path",
    image: "camera-path-thumbnail.png",
    iTwinViewerReady: true,
    description: "#Animates the #camera along a path using #setEyePoint.  Also shows a #tool to control the look direction using #setupViewFromFrustum.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CameraPathApi.ts", import: import("!!raw-loader!./CameraPathApi") },
      { name: "CameraPathApp.tsx", import: import("!!raw-loader!./CameraPathApp"), entry: true },
      { name: "CameraPathWidget.tsx", import: import("!!raw-loader!./CameraPathWidget") },
      { name: "CameraPathTool.ts", import: import("!!raw-loader!./CameraPathTool") },
      { name: "Coordinates.ts", import: import("!!raw-loader!./Coordinates.ts") },
      { name: "CameraPath.scss", import: import("!!raw-loader!./CameraPath.scss") },
    ],
    type: "CameraPathApp.tsx",
  });
}
