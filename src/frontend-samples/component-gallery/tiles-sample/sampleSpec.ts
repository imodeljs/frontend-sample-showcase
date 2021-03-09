/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTilesSpec(): SampleSpec {
  return ({
    name: "tiles-sample",
    label: "UI-Tiles",
    image: "ui-tile-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Tiles.tsx", import: import("!!raw-loader!./Tiles"), entry: true },
    ],
    type: "Tiles.tsx",
  });
}
