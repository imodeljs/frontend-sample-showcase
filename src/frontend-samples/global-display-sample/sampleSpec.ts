/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getGlobalDisplaySpec(): SampleSpec {
  return ({
    name: "global-display-sample",
    label: "Global Data",
    image: "global-display-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./GlobalDisplayApi"),
      import("!editor-file-loader!./GlobalDisplayApp?entry=true"),
      import("!editor-file-loader!./GlobalDisplayWidget"),
      import("!editor-file-loader!./GlobalDisplay.scss"),
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "GlobalDisplayApp.tsx",
  });
}

