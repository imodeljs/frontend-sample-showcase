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
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "TooltipCustomizeApi.tsx", import: import("-!raw-loader!./TooltipCustomizeApi") },
      { name: "TooltipCustomizeApp.tsx", import: import("-!raw-loader!./TooltipCustomizeApp"), entry: true },
      { name: "TooltipCustomizeWidget.tsx", import: import("-!raw-loader!./TooltipCustomizeWidget") },
      { name: "TooltipCustomize.scss", import: import("-!raw-loader!./TooltipCustomize.scss") },
    ],
    iTwinViewerReady: true,
    type: "TooltipCustomizeApp.tsx",
  });
}
