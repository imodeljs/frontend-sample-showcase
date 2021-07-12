/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getShadowStudySpec(): SampleSpec {
  return ({
    name: "shadow-study-sample",
    label: "Shadow Study",
    image: "shadow-study-thumbnail.png",
    description: "#Sample showing how to adjust the #solar #lighting by using #setSunTime.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ShadowStudyApi"),
      import("!editor-file-loader!./ShadowStudyApp?entry=true"),
      import("!editor-file-loader!./ShadowStudyWidget"),
      import("!editor-file-loader!./ShadowStudy.scss"),
    ],
    type: "ShadowStudyApp.tsx",
  });
}
