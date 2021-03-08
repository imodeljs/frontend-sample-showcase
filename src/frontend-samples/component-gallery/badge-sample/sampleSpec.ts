/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import BadgeList from "./Badge";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getBadgeSpec(): SampleSpec {
  return ({
    name: "badge-sample",
    label: "UI-Badges",
    image: "ui-badge-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    customModelList: [],
    files: () => [
      { name: "Badge.tsx", import: import("!!raw-loader!./Badge"), entry: true },
    ],
    sampleClass: BadgeList,
    type: "BadgeList",
  });
}
