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
      import("!editor-file-loader!./CameraPathApi"),
      import("!editor-file-loader!./CameraPathApp?entry=true"),
      import("!editor-file-loader!./CameraPathWidget"),
      import("!editor-file-loader!./CameraPathTool"),
      import("!editor-file-loader!./Coordinates"),
      import("!editor-file-loader!./CameraPath.scss"),
    ],
    type: "CameraPathApp.tsx",
  });
}
