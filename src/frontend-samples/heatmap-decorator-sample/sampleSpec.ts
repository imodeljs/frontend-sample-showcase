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
    description: "Uses a #Decorator to show a #heatmap as a #WorldOverlay on top of the viewport.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./HeatmapDecoratorApi"),
      import("!editor-file-loader!./HeatmapDecoratorApp?entry=true"),
      import("!editor-file-loader!./HeatmapDecoratorWidget"),
      import("!editor-file-loader!./HeatmapDecorator"),
      import("!editor-file-loader!./HeatmapDecorator.scss"),
    ],
    iTwinViewerReady: true,
    type: "HeatmapDecoratorApp.tsx",
  });
}
