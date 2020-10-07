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
      { name: "TooltipCustomizeApp.tsx", import: import("!!raw-loader!./TooltipCustomizeApp"), entry: true },
      { name: "TooltipCustomizeUI.tsx", import: import("!!raw-loader!./TooltipCustomizeUI") },
    ],
    setup: TooltipCustomizeApp.setup.bind(TooltipCustomizeApp),
    teardown: TooltipCustomizeApp.teardown.bind(TooltipCustomizeApp),
  });
}
