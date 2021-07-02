/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimpleLineSpec(): SampleSpec {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    description: "#Simple #geometry #sample showing how to create a #line #segment using #LineSegment3d and create #points along it using #fractionToPoint.",

    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "SimpleLineApi.ts", import: import("!!raw-loader!./SimpleLineApi") },
      { name: "SimpleLineApp.tsx", import: import("!!raw-loader!./SimpleLineApp"), entry: true },
      { name: "SimpleLineWidget.tsx", import: import("!!raw-loader!./SimpleLineWidget") },
      { name: "GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "InteractivePointMarker.ts", import: import("!!raw-loader!./InteractivePointMarker") },
      { name: "SimpleLine.scss", import: import("!!raw-loader!./SimpleLine.scss") },
    ],
    type: "SimpleLineApp.tsx",
  });
}
