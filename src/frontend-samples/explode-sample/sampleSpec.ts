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
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ExplodeApi.ts", import: import("!!raw-loader!./ExplodeApi") },
      { name: "ExplodeApp.tsx", import: import("!!raw-loader!./ExplodeApp"), entry: true },
      { name: "ExplodeWidget.tsx", import: import("!!raw-loader!./ExplodeWidget") },
      { name: "ExplodeTile.ts", import: import("!!raw-loader!./ExplodeTile") },
      { name: "Explode.scss", import: import("!!raw-loader!./Explode.scss") },
    ],
    type: "ExplodeApp.tsx",
  });
}
