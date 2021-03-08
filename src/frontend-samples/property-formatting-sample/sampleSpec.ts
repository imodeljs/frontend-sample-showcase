/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "property-formatting-thumbnail.png",
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "PropertyFormattingUI.tsx", import: import("!!raw-loader!./PropertyFormattingUI"), entry: true },
      { name: "PropertyFormattingApp.tsx", import: import("!!raw-loader!./PropertyFormattingApp") },
      { name: "approach-1-UI.tsx", import: import("!!raw-loader!./approach-1-UI") },
      { name: "approach-2-UI.tsx", import: import("!!raw-loader!./approach-2-UI") },
      { name: "approach-3-UI.tsx", import: import("!!raw-loader!./approach-3-UI") },
    ],
    type: "PropertyFormattingUI",
  });
}
