/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    description: "How to get and set various #ViewFlags and other #view attributes including: #RenderMode, #Skybox, #BackgroundMap, #Grid, #ACS, and others.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ViewAttributesApi"),
      import("!editor-file-loader!./ViewAttributesApp?entry=true"),
      import("!editor-file-loader!./ViewAttributesWidget"),
      import("!editor-file-loader!./ViewAttributes.scss"),
    ],
    type: "ViewAttributesApp.tsx",
  });
}
