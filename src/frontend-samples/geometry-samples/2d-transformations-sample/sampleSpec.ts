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
    description: "#Geometry #sample showing how to generate, #translate, and #rotate different types of #2d geometry.",

    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "2dTransformationsApi.ts", import: import("!!raw-loader!./2dTransformationsApi") },
      { name: "2dTransformationsApp.tsx", import: import("!!raw-loader!./2dTransformationsApp"), entry: true },
      { name: "2dTransformationsWidget.tsx", import: import("!!raw-loader!./2dTransformationsApp") },
      { name: "GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "2dTransofrmations.scss", import: import("!!raw-loader!./2dTransformations.scss") },
    ],
    type: "2dTransformationsApp.tsx",
  });
}
