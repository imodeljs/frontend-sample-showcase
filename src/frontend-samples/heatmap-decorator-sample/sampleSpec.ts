/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getHeatmapDecoratorSpec(): SampleSpec {
  return ({
    name: "heatmap-decorator-sample",
    label: "Heatmap Decorator",
    image: "heatmap-decorator-thumbnail.png",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "HeatmapDecoratorApp.tsx", import: import("!!raw-loader!./HeatmapDecoratorApp") },
      { name: "HeatmapDecoratorUI.tsx", import: import("!!raw-loader!./HeatmapDecoratorUI"), entry: true },
      { name: "HeatmapDecoratorWidget.tsx", import: import("!!raw-loader!./HeatmapDecoratorWidget") },
      { name: "HeatmapDecorator.ts", import: import("!!raw-loader!./HeatmapDecorator") },
    ],
    iTwinViewerReady: true,
    type: "HeatmapDecoratorUI.tsx",
  });
}
