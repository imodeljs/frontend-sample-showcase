/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox";
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import ExplodeUI from "./ExplodeUI";

export function getExplodeSpec(): SampleMetadata {
  return ({
    name: "explode-sample",
    label: "Exploded View",
    image: "exploded-view-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    modelList: [SampleIModels.House],
    files: [
      { name: "ExplodeApp.tsx", import: import("!!raw-loader!./ExplodeApp") },
      { name: "ExplodeUI.tsx", import: import("!!raw-loader!./ExplodeUI"), entry: true },
      { name: "ExplodeTile.ts", import: import("!!raw-loader!./ExplodeTile") },
    ],
    sampleClass: ExplodeUI,
  });
}
