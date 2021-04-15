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
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewAttributesApi.ts", import: import("!!raw-loader!./ViewAttributesApi") },
      { name: "ViewAttributesApp.tsx", import: import("!!raw-loader!./ViewAttributesApp"), entry: true },
      { name: "ViewAttributesWidget.tsx", import: import("!!raw-loader!./ViewAttributesWidget") },
      { name: "ViewAttributes.scss", import: import("!!raw-loader!./ViewAttributes.scss") },
    ],
    type: "ViewAttributesApp.tsx",
  });
}
