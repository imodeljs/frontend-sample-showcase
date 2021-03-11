/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import Advanced3dUI from "./Advanced3dUI";

export function getAdvanced3dSpec(): SampleMetadata {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Advanced3dApp.tsx", import: import("!!raw-loader!./Advanced3dApp") },
      { name: "Advanced3dUI.tsx", import: import("!!raw-loader!./Advanced3dUI"), entry: true },
    ],
    sampleClass: Advanced3dUI,
  });
}
