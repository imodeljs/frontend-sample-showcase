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
    description: "Uses #issues REST #API to retrieve issues associated with project and display them.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./IssuesApi"),
      import("!editor-file-loader!./IssuesApp?entry=true"),
      import("!editor-file-loader!./IssuesWidget"),
      import("!editor-file-loader!./IssuesClient"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx"),
      import("!editor-file-loader!./Issues.scss"),
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "IssuesApp.tsx",
  });
}
