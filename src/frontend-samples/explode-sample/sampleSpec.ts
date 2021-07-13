/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getExplodeSpec(): SampleSpec {
  return ({
    name: "explode-sample",
    label: "Exploded View",
    image: "exploded-view-thumbnail.png",
    iModelList: [SampleIModels.House],
    description: "Uses a #TileTree to create an #explode effect in the viewport.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ExplodeApi"),
      import("!editor-file-loader!./ExplodeApp?entry=true"),
      import("!editor-file-loader!./ExplodeWidget"),
      import("!editor-file-loader!./ExplodeTile"),
      import("!editor-file-loader!./Explode.scss"),
    ],
    type: "ExplodeApp.tsx",
  });
}
