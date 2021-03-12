/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import PresentationTreeUI from "./PresentationTreeUI";

export function getPresentationTreeSpec(): SampleSpec {
  return ({
    name: "presetation-tree-sample",
    label: "Presentation Tree",
    image: "presentation-tree-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "PresentationTreeApp.tsx", import: import("!!raw-loader!./PresentationTreeApp") },
      { name: "PresentationTreeUI.tsx", import: import("!!raw-loader!./PresentationTreeUI"), entry: true },
    ],
    sampleClass: PresentationTreeUI,
  });
}
