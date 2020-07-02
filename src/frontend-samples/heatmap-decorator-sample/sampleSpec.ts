/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import HeatmapDecoratorApp from "./HeatmapDecoratorApp";

export function getHeatmapDecoratorSpec(): SampleSpec {
  return ({
    name: "heatmap-decorator-sample",
    label: "Heatmap Decorator",
    image: "heatmap-decorator-thumbnail.png",
    files: [
      { name: "HeatmapDecoratorApp.tsx", import: import("!!raw-loader!./HeatmapDecoratorApp"), entry: true },
      { name: "HeatmapDecoratorUI.tsx", import: import("!!raw-loader!./HeatmapDecoratorUI"), entry: true },
      { name: "HeatmapDecorator.tsx", import: import("!!raw-loader!./HeatmapDecorator") },
    ],
    setup: HeatmapDecoratorApp.setup,
    teardown: HeatmapDecoratorApp.teardown,
  });
}
