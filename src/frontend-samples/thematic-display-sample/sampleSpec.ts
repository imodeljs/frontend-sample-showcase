/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    description: "Renders using #thematic display by changing the #styles.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ThematicDisplayApi"),
      import("!editor-file-loader!./ThematicDisplayApp?entry=true"),
      import("!editor-file-loader!./ThematicDisplayWidget"),
      import("!editor-file-loader!./ThematicDisplay.scss"),
    ],
    iModelList: [SampleIModels.CoffsHarborDemo, SampleIModels.RetailBuilding],
    type: "ThematicDisplayApp.tsx",
  });
}
