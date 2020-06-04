import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { TooltipCustomizeApp } from ".";

export function getTooltipCustomizeSpec(): SampleSpec {
  return ({
    name: "tooltip-customize-sample",
    label: "Tooltip Customize",
    image: "tooltip-customize-thumbnail.png",
    files: [
      { name: "TooltipSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "showcasetooladmin.ts", import: import("!!raw-loader!../../api/showcasetooladmin") },
    ],
    setup: TooltipCustomizeApp.setup,
    teardown: TooltipCustomizeApp.teardown,
  });
}