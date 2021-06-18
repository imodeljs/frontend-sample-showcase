/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getVersionCompareSpec(): SampleSpec {
  return ({
    name: "version-review-sample",
    label: "Version Compare Review",
    image: "versionCompare.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "VersionCompareApp.tsx", import: import("!!raw-loader!./VersionCompareApp.tsx") },
      { name: "VersionCompareWidget.tsx", import: import("!!raw-loader!./VersionCompareWidget.tsx") },
      { name: "VersionCompareApi.ts", import: import("!!raw-loader!./VersionCompareApi.ts"), entry: true },
    ],
    iModelList: [SampleIModels.Stadium],
    type: "VersionCompareApp.tsx",
  });
}
