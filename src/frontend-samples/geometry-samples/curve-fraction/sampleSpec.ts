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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "CurveFractionApp.tsx", import: import("!!raw-loader!./CurveFractionApp") },
      { name: "CurveFractionUI.tsx", import: import("!!raw-loader!./CurveFractionUI"), entry: true },
      { name: "common/SampleCurveFactory.ts", import: import("!!raw-loader!common/Geometry/SampleCurveFactory") },
      { name: "common/InteractivePointMarker.ts", import: import("!!raw-loader!common/Geometry/InteractivePointMarker") },
    ],
    type: "CurveFractionUI.tsx",
  });
}
