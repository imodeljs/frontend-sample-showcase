/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import TooltipCustomizeApp from "./TooltipCustomizeApp";

export function getTooltipCustomizeSpec(): SampleSpec {
  return ({
    name: "tooltip-customize-sample",
    label: "Tooltip Customize",
    image: "tooltip-customize-thumbnail.png",
    files: [
      { name: "TooltipCustomizeApp.tsx", import: import("!!raw-loader!./TooltipCustomizeApp") },
      { name: "TooltipCustomizeUI.tsx", import: import("!!raw-loader!./TooltipCustomizeUI") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "SampleToolAdmin.ts", import: import("!!raw-loader!./SampleToolAdmin") },
      { name: "showcasetooladmin.tsx", import: import("!!raw-loader!../../api/showcasetooladmin") },
    ],
    setup: TooltipCustomizeApp.setup,
    teardown: TooltipCustomizeApp.teardown,
  });
}
