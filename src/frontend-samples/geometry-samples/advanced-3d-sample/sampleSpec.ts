/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getAdvanced3dSpec(): SampleSpec {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    description: "#Geometry #sample showing how to generate several #3d pieces of geometry including #mitered #pipes, #rotational, #linear, and #ruled, #sweeps.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./Advanced3dApi"),
      import("!editor-file-loader!./Advanced3dApp?entry=true"),
      import("!editor-file-loader!./Advanced3dWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./Advanced3d.scss"),
    ],
    type: "Advanced3dApp.tsx",
  });
}
