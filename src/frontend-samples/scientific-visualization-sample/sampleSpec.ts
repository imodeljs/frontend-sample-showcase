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
      import("!editor-file-loader!./AnimationApi"),
      import("!editor-file-loader!./Cantilever"),
      import("!editor-file-loader!./AnimationApp?entry=true"),
      import("!editor-file-loader!./AnimationWidget"),
      import("!editor-file-loader!./AnalysisDecorator"),
      import("!editor-file-loader!./AnimationWidget.scss"),
    ],
    type: "AnimationApp.tsx",
  });
}
