/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { TooltipCustomizeApp } from ".";

export function getTooltipCustomizeSpec(): SampleSpec {
  return ({
    name: "tooltip-customize-sample",
    label: "Tooltip Customize",
    image: "tooltip-customize-thumbnail.png",
    files: [
      { name: "TooltipSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: TooltipCustomizeApp.setup,
    teardown: TooltipCustomizeApp.teardown,
  });
}
