/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import ShadowStudyUI from "./ShadowStudyUI";

export function getShadowStudySpec(): SampleSpec {
  return ({
    name: "shadow-study-sample",
    label: "Shadow Study",
    image: "shadow-study-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ShadowStudyApp.tsx", import: import("!!raw-loader!./ShadowStudyApp") },
      { name: "ShadowStudyUI.tsx", import: import("!!raw-loader!./ShadowStudyUI"), entry: true },
    ],
    sampleClass: ShadowStudyUI,
  });
}
