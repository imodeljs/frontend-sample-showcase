/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import ClosestPointOnCurveUI from "./ClosestPointOnCurveUI";

export function getClosestPointOnCurveSpec(): SampleMetadata {
  return ({
    name: "closest-point-curve-sample",
    label: "Closest Point on Curve",
    image: "closest-point-curve-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClosestPointOnCurveApp.tsx", import: import("!!raw-loader!./ClosestPointOnCurveApp") },
      { name: "ClosestPointOnCurveUI.tsx", import: import("!!raw-loader!./ClosestPointOnCurveUI"), entry: true },
      { name: "common/SampleCurveFactory.ts", import: import("!!raw-loader!common/Geometry/SampleCurveFactory") },
      { name: "common/InteractivePointMarker.ts", import: import("!!raw-loader!common/Geometry/InteractivePointMarker") },
    ],
    sampleClass: ClosestPointOnCurveUI,
  });
}
