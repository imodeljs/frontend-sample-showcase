/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Advanced3dUI from "./Advanced3dUI";

export function getAdvanced3dSpec(): SampleSpec {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Advanced3dUI.tsx", import: import("!!raw-loader!./Advanced3dUI"), entry: true },
      { name: "Advanced3dApp.tsx", import: import("!!raw-loader!./Advanced3dApp") },

    ],
    sampleClass: Advanced3dUI,
  });
}
