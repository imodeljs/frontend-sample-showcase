/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getDisplayStylesSpec(): SampleSpec {
  return ({
    name: "display-styles-sample",
    label: "Display Styles",
    image: "display-styles-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "DisplayStylesApi.tsx", import: import("!!raw-loader!./DisplayStylesApi") },
      { name: "DisplayStylesApp.tsx", import: import("!!raw-loader!./DisplayStylesApp"), entry: true },
      { name: "DisplayStylesWidget.tsx", import: import("!!raw-loader!./DisplayStylesWidget") },
      { name: "Styles.ts", import: import("!!raw-loader!./Styles") },
      { name: "DisplayStyles.scss", import: import("!!raw-loader!./DisplayStyles.scss") },
    ],
    iModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    type: "DisplayStylesApp.tsx",
  });
}
