/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";

export function getScientificVisualizationSpec(): SampleSpec {
  return ({
    name: "scientific-visualization-sample",
    label: "Scientific Visualization",
    image: "scientific-visualization-thumbnail.png",
    description: "#Sample showing #scientific #visualization and #animation.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ScientificVizApp?entry=true"),
      import("!editor-file-loader!./ScientificVizWidget"),
      import("!editor-file-loader!./ScientificVizApi"),
      import("!editor-file-loader!./ScientificVizDecorator"),
      import("!editor-file-loader!./Cantilever"),
      import("!editor-file-loader!./ScientificViz.scss"),
    ],
    type: "ScientificVizApp.tsx",
  });
}
