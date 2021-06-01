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
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "HeatmapDecoratorApi.ts", import: import("-!raw-loader!./HeatmapDecoratorApi") },
      { name: "HeatmapDecoratorApp.tsx", import: import("-!raw-loader!./HeatmapDecoratorApp"), entry: true },
      { name: "HeatmapDecoratorWidget.tsx", import: import("-!raw-loader!./HeatmapDecoratorWidget") },
      { name: "HeatmapDecorator.ts", import: import("-!raw-loader!./HeatmapDecorator") },
      { name: "HeatmapDecorator.scss", import: import("-!raw-loader!./HeatmapDecorator.scss") },
    ],
    iTwinViewerReady: true,
    type: "HeatmapDecoratorApp.tsx",
  });
}
