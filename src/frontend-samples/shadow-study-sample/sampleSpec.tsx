/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { ShadowStudyApp } from ".";

export function getShadowStudySpec(): SampleSpec {
  return ({
    name: "shadow-study-sample",
    label: "Shadow Study",
    image: "shadow-study-thumbnail.png",
    files: [
      { name: "ShadowStudyApp.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "ReloadableViewport.tsx", import: import("!!raw-loader!../../Components/Viewport/ReloadableViewport") },
      { name: "viewSetup.ts", import: import("!!raw-loader!../../api/viewSetup") },
    ],
    setup: ShadowStudyApp.setup,
  });
}
