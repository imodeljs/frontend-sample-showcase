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
    description: "#Animates the #camera along a path using #setEyePoint.  Also shows a #tool to control the look direction using #setupViewFromFrustum.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./CameraPathUI?entry=true"),
      import("!editor-file-loader!./CameraPathApp"),
      import("!editor-file-loader!./CameraPathTool"),
      import("!editor-file-loader!./Coordinates.ts"),
    ],
    type: "CameraPathUI.tsx",
  });
}
