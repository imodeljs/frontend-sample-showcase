/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getClosestPointOnCurveSpec(): SampleSpec {
  return ({
    name: "closest-point-curve-sample",
    label: "Closest Point on Curve",
    image: "closest-point-curve-thumbnail.png",
    description: "#Geometry #sample showing how to find the #closest #point on a #curve by using the #closestPoint method.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ClosestPointOnCurveApi"),
      import("!editor-file-loader!./ClosestPointOnCurveApp?entry=true"),
      import("!editor-file-loader!./ClosestPointOnCurveWidget"),
      import("!editor-file-loader!common/Geometry/GeometryDecorator"),
      import("!editor-file-loader!./SampleCurveFactory"),
      import("!editor-file-loader!./InteractivePointMarker"),
      import("!editor-file-loader!./ClosestPointOnCurve.scss"),
    ],
    type: "ClosestPointOnCurveApp.tsx",
  });
}
