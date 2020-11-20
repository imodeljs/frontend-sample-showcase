/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CurveFractionApp from "./CurveFractionApp";

export function getCurveFractionSpec(): SampleSpec {
  return ({
    name: "curve-fraction-sample",
    label: "Curve Fractions",
    image: "curve-fraction-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CurveFractionApp.tsx", import: import("!!raw-loader!./CurveFractionApp"), entry: true },
      { name: "CurveFractionUI.tsx", import: import("!!raw-loader!./CurveFractionUI") },
      { name: "common/InteractivePointMarker.tsx", import: import("!!raw-loader!../../../common/InteractivePointMarker") },
    ],
    setup: CurveFractionApp.setup.bind(CurveFractionApp),
  });
}
