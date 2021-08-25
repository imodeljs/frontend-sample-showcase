/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import { getSimpleLineSpec } from "../simple-line-sample/sampleSpec";

export function getGeometric3dSpec(): SampleSpec {
  return ({
    name: "geometric-3d-sample",
    label: "Geometric 3d",
    image: "geometric-3d-thumbnail.png",
    description: "#Geometry #sample showing how to generate #simple types of #3d geometry including #boxes, #spheres, #cones, #torus #pipes, #mitered #pipes, #rotational, #linear, and #ruled, #sweeps.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getSimpleLineSpec(),
      ],
    }),
    files: () => [
      import("!editor-file-loader!./Geometric3dApi"),
      import("!editor-file-loader!./Geometric3dApp?entry=true"),
      import("!editor-file-loader!./Geometric3dWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./Geometric3d.scss"),
    ],
    type: "Geometric3dApp.tsx",
  });
}
