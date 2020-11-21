/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewCameraApp from "./ViewCameraApp";

export function getViewCameraSpec(): SampleSpec {
  return ({
    name: "view-camera-sample",
    label: "View Camera",
    image: "view-attributes-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewCameraApp.tsx", import: import("!!raw-loader!./ViewCameraApp"), entry: true },
      { name: "ViewCameraUI.tsx", import: import("!!raw-loader!./ViewCameraUI") },
    ],
    setup: ViewCameraApp.setup.bind(ViewCameraApp),
  });
}
