/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import BadgeList from "./Badge";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getBadgeSpec(): SampleMetadata {
  return ({
    name: "badge-sample",
    label: "UI-Badges",
    image: "ui-badge-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    modelList: [],
    files: [
      { name: "Badge.tsx", import: import("!!raw-loader!./Badge"), entry: true },
    ],
    sampleClass: BadgeList,
  });
}
