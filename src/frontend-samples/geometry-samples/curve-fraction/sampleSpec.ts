/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import CurveFractionUI from "./CurveFractionUI";

export function getCurveFractionSpec(): SampleMetadata {
  return ({
    name: "curve-fraction-sample",
    label: "Curve Fractions",
    image: "curve-fraction-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CurveFractionApp.tsx", import: import("!!raw-loader!./CurveFractionApp") },
      { name: "CurveFractionUI.tsx", import: import("!!raw-loader!./CurveFractionUI"), entry: true },
      { name: "common/SampleCurveFactory.ts", import: import("!!raw-loader!common/Geometry/SampleCurveFactory") },
      { name: "common/InteractivePointMarker.ts", import: import("!!raw-loader!common/Geometry/InteractivePointMarker") },
    ],
    sampleClass: CurveFractionUI,
  });
}
