/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getTooltipCustomizeSpec(): SampleSpec {
  return ({
    name: "tooltip-customize-sample",
    label: "Tooltip Customize",
    image: "tooltip-customize-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "TooltipCustomizeApp.tsx", import: import("!!raw-loader!./TooltipCustomizeApp") },
      { name: "TooltipCustomizeUI.tsx", import: import("!!raw-loader!./TooltipCustomizeUI"), entry: true },
    ],
    type: "TooltipCustomizeUI.tsx",
  });
}
