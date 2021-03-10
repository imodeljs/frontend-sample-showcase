/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function get2dTransformationsSpec(): SampleSpec {
  return ({
    name: "2d-transformations-sample",
    label: "2d Transformations",
    image: "2d-transformations-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "2dTransformationsApp.tsx", import: import("!!raw-loader!./2dTransformationsApp") },
      { name: "2dTransformationsUI.tsx", import: import("!!raw-loader!./2dTransformationsUI"), entry: true },
    ],
    type: "2dTransformationsUI.tsx",
  });
}
