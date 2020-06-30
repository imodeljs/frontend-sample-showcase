/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import BadgeList from ".";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getBadgeSpec(): SampleSpec {
  return ({
    name: "badge-sample",
    label: "UI-Badges",
    image: "ui-badge-thumbnail.png",
    customModelList: [],
    files: [
      { name: "BadgeSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: BadgeList.setup,
  });
}
