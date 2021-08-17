/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimpleLineSpec(): SampleSpec {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    description: "#Simple #geometry #sample showing how to create a #line #segment using #LineSegment3d and create #points along it using #fractionToPoint.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./SimpleLineApi"),
      import("!editor-file-loader!./SimpleLineApp?entry=true"),
      import("!editor-file-loader!./SimpleLineWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./InteractivePointMarker"),
      import("!editor-file-loader!./SimpleLine.scss"),
    ],
    type: "SimpleLineApp.tsx",
  });
}
