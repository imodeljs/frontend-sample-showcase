/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { getViewportOnlySpec } from "frontend-samples/viewport-only-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";
import { getSimpleLineSpec } from "../simple-line-sample/sampleSpec";

export function getSimple3dSpec(): SampleSpec {
  return ({
    name: "simple-3d-sample",
    label: "Simple 3d",
    image: "simple-3d-thumbnail.png",
    description: "#Geometry #sample showing how to generate #simple types of #3d geometry.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getSimpleLineSpec(),
      ],
    }),
    files: () => [
      import("!editor-file-loader!./Simple3dApi"),
      import("!editor-file-loader!./Simple3dApp?entry=true"),
      import("!editor-file-loader!./Simple3dWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./Simple3d.scss"),
    ],
    type: "Simple3dApp.tsx",
  });
}
