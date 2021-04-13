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
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ShadowStudyApi.ts", import: import("!!raw-loader!./ShadowStudyApi") },
      { name: "ShadowStudyApp.tsx", import: import("!!raw-loader!./ShadowStudyApp"), entry: true },
      { name: "ShadowStudyWidget.tsx", import: import("!!raw-loader!./ShadowStudyWidget") },
      { name: "ShadowStudy.scss", import: import("!!raw-loader!./ShadowStudy.scss") },
    ],
    type: "ShadowStudyApp.tsx",
  });
}
