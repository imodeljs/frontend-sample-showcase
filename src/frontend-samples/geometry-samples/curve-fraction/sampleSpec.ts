/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { getMarkerPinSpec } from "frontend-samples/marker-pin-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";
import { getSimpleLineSpec } from "../simple-line-sample/sampleSpec";

export function getCurveFractionSpec(): SampleSpec {
  return ({
    name: "curve-fraction-sample",
    label: "Curve Fractions",
    image: "curve-fraction-thumbnail.png",
    description: "#Geometry #sample showing how to find a #point along a set #fraction of a #curve using the #fractionToPointAndDerivative method",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getSimpleLineSpec(),
        getMarkerPinSpec(),
      ],
    }),
    files: () => [
      import("!editor-file-loader!./CurveFractionApi"),
      import("!editor-file-loader!./CurveFractionApp?entry=true"),
      import("!editor-file-loader!./CurveFractionWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./SampleCurveFactory"),
      import("!editor-file-loader!./InteractivePointMarker"),
      import("!editor-file-loader!./CurveFraction.scss"),
    ],
    type: "CurveFractionApp.tsx",
  });
}
