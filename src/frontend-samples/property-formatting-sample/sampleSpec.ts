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
    description: "Uses the #Presentation API to display element #properties.",
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./PropertyFormattingApi"),
      import("!editor-file-loader!./PropertyFormattingApp?entry=true"),
      import("!editor-file-loader!./PropertyFormattingWidget"),
      import("!editor-file-loader!./approach-1-App"),
      import("!editor-file-loader!./approach-2-App"),
      import("!editor-file-loader!./approach-3-App"),
      import("!editor-file-loader!./PropertyFormatting.scss"),
    ],
    type: "PropertyFormattingApp.tsx",
  });
}
