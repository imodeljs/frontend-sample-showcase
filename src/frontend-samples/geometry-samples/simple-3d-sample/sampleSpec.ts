/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Simple3dUI from "./Simple3dUI";

export function getSimple3dSpec(): SampleSpec {
  return ({
    name: "simple-3d-sample",
    label: "Simple 3d",
    image: "simple-3d-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Simple3dUI.tsx", import: import("!!raw-loader!./Simple3dUI"), entry: true },
      { name: "Simple3dApp.tsx", import: import("!!raw-loader!./Simple3dApp") },
    ],
    sampleClass: Simple3dUI,
  });
}
