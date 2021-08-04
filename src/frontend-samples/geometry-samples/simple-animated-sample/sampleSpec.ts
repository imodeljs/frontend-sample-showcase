/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimpleAnimatedSpec(): SampleSpec {
  return ({
    name: "simple-animated-sample",
    label: "Simple Animated",
    image: "simple-animated-thumbnail.png",
    description: "#Geometry #sample showing how to create #animation using multiples #2d shapes",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./SimpleAnimatedApi"),
      import("!editor-file-loader!./SimpleAnimatedApp?entry=true"),
      import("!editor-file-loader!./ConwaysGameOfLife"),
      import("!editor-file-loader!./SimpleAnimatedWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./SimpleAnimated.scss"),
    ],
    type: "SimpleAnimatedApp.tsx",
  });
}
