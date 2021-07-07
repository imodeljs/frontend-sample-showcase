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
    description: "Shows customized element #tooltips by supplying a #ToolAdmin that overrides the #getToolTip method.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./TooltipCustomizeApi"),
      import("!editor-file-loader!./TooltipCustomizeApp?entry=true"),
      import("!editor-file-loader!./TooltipCustomizeWidget"),
      import("!editor-file-loader!./TooltipCustomize.scss"),
    ],
    iTwinViewerReady: true,
    type: "TooltipCustomizeApp.tsx",
  });
}
