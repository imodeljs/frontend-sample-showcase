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
    iModelList: [],
    readme: async () => import("-!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    files: () => [
      { name: "ClosestPointOnCurveApi.ts", import: import("-!raw-loader!./ClosestPointOnCurveApi") },
      { name: "ClosestPointOnCurveApp.tsx", import: import("-!raw-loader!./ClosestPointOnCurveApp"), entry: true },
      { name: "ClosestPointOnCurveWidget.tsx", import: import("-!raw-loader!./ClosestPointOnCurveWidget") },
      { name: "GeometryDecorator.ts", import: import("-!raw-loader!./GeometryDecorator") },
      { name: "SampleCurveFactory.ts", import: import("-!raw-loader!./SampleCurveFactory") },
      { name: "InteractivePointMarker.ts", import: import("-!raw-loader!./InteractivePointMarker") },
      { name: "ClosestPointOnCurve.scss", import: import("-!raw-loader!./ClosestPointOnCurve.scss") },
    ],
    type: "ClosestPointOnCurveApp.tsx",
  });
}
