/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getCurveFractionSpec(): SampleSpec {
  return ({
    name: "curve-fraction-sample",
    label: "Curve Fractions",
    image: "curve-fraction-thumbnail.png",
    iModelList: [],
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CurveFractionApi.ts", import: import("!!raw-loader!./CurveFractionApi") },
      { name: "CurveFractionApp.tsx", import: import("!!raw-loader!./CurveFractionApp"), entry: true },
      { name: "CurveFractionWidget.tsx", import: import("!!raw-loader!./CurveFractionWidget") },
      { name: "./GeometryDecorator.ts", import: import("!!raw-loader!./GeometryDecorator") },
      { name: "./SampleCurveFactory.ts", import: import("!!raw-loader!./SampleCurveFactory") },
      { name: "./InteractivePointMarker.ts", import: import("!!raw-loader!./InteractivePointMarker") },
      { name: "CurveFraction.scss", import: import("!!raw-loader!./CurveFraction.scss") },
    ],
    type: "CurveFractionApp.tsx",
  });
}
