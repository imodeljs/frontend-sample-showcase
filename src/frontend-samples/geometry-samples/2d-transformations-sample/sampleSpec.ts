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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./2dTransformationsApi"),
      import("!editor-file-loader!./2dTransformationsApp?entry=true"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./2dTransformations.scss"),
    ],
    type: "2dTransformationsApp.tsx",
  });
}
