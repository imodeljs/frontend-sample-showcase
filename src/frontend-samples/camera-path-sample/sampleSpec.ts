/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import CameraPathUI from "./CameraPathUI";

export function getViewCameraSpec(): SampleSpec {
  return ({
    name: "Camera Path Sample",
    label: "Camera Path",
    image: "camera-path-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CameraPathUI.tsx", import: import("!!raw-loader!./CameraPathUI"), entry: true },
      { name: "CameraPathApp.tsx", import: import("!!raw-loader!./CameraPathApp") },
      { name: "CameraPathTool.ts", import: import("!!raw-loader!./CameraPathTool") },
      { name: "Coordinates.ts", import: import("!!raw-loader!./Coordinates.ts") },

    ],
    sampleClass: CameraPathUI,
  });
}
