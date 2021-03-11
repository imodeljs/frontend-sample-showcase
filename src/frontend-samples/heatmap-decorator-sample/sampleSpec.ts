/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import HeatmapDecoratorUI from "./HeatmapDecoratorUI";

export function getHeatmapDecoratorSpec(): SampleMetadata {
  return ({
    name: "heatmap-decorator-sample",
    label: "Heatmap Decorator",
    image: "heatmap-decorator-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "HeatmapDecoratorApp.tsx", import: import("!!raw-loader!./HeatmapDecoratorApp") },
      { name: "HeatmapDecoratorUI.tsx", import: import("!!raw-loader!./HeatmapDecoratorUI"), entry: true },
      { name: "HeatmapDecorator.ts", import: import("!!raw-loader!./HeatmapDecorator") },
    ],
    sampleClass: HeatmapDecoratorUI,
  });
}
