/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "property-formatting-thumbnail.png",
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown],
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "PropertyFormattingApi.ts", import: import("-!raw-loader!./PropertyFormattingApi") },
      { name: "PropertyFormattingApp.tsx", import: import("-!raw-loader!./PropertyFormattingApp"), entry: true },
      { name: "PropertyFormattingWidget.tsx", import: import("-!raw-loader!./PropertyFormattingWidget") },
      { name: "approach-1-App.tsx", import: import("-!raw-loader!./approach-1-App") },
      { name: "approach-2-App.tsx", import: import("-!raw-loader!./approach-2-App") },
      { name: "approach-3-App.tsx", import: import("-!raw-loader!./approach-3-App") },
      { name: "PropertyFormatting.scss", import: import("-!raw-loader!./PropertyFormatting.scss") },
    ],
    type: "PropertyFormattingApp.tsx",
  });
}
