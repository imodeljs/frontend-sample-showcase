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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ViewAttributesApp.tsx", import: import("!!raw-loader!./ViewAttributesApp") },
      { name: "ViewAttributesUI.tsx", import: import("!!raw-loader!./ViewAttributesUI"), entry: true },
    ],
    type: "ViewAttributesUI.tsx",
  });
}
