/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getIssuesSpec(): SampleSpec {
  return ({
    name: "issue-sample",
    label: "Issues",
    image: "issues-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "frontend-samples/issues-sample/IssuesApi.tsx", import: import("!!raw-loader!./IssuesApi") },
      { name: "frontend-samples/issues-sample/IssuesApp.tsx", import: import("!!raw-loader!./IssuesApp"), entry: true },
      { name: "frontend-samples/issues-sample/IssuesWidget.tsx", import: import("!!raw-loader!./IssuesWidget") },
      { name: "frontend-samples/issues-sample/IssuesClient.ts", import: import("!!raw-loader!./IssuesClient") },
      { name: "frontend-samples/marker-pin-sample/MarkerPinDecorator.ts", import: import("!!raw-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts") },
      { name: "frontend-samples/issues-sample/Issues.scss", import: import("!!raw-loader!./Issues.scss") },
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "IssuesApp.tsx",
  });
}
