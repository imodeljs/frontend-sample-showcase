/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import TooltipCustomizeUI from "./TooltipCustomizeUI";

export function getTooltipCustomizeSpec(): SampleMetadata {
  return ({
    name: "tooltip-customize-sample",
    label: "Tooltip Customize",
    image: "tooltip-customize-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "TooltipCustomizeApp.tsx", import: import("!!raw-loader!./TooltipCustomizeApp") },
      { name: "TooltipCustomizeUI.tsx", import: import("!!raw-loader!./TooltipCustomizeUI"), entry: true },
    ],
    sampleClass: TooltipCustomizeUI,
  });
}
