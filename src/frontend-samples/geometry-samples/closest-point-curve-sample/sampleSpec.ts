/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ClosestPointOnCurveApp from "./ClosestPointOnCurveApp";

export function getClosestPointOnCurveSpec(): SampleSpec {
  return ({
    name: "closest-point-curve-sample",
    label: "Closest Point on Curve",
    image: "closest-point-curve-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ClosestPointOnCurveApp.tsx", import: import("!!raw-loader!./ClosestPointOnCurveApp"), entry: true },
      { name: "ClosestPointOnCurveUI.tsx", import: import("!!raw-loader!./ClosestPointOnCurveUI") },
      { name: "common/InteractivePointMarker.tsx", import: import("!!raw-loader!../../../common/InteractivePointMarker") },
    ],
    setup: ClosestPointOnCurveApp.setup.bind(ClosestPointOnCurveApp),
  });
}
