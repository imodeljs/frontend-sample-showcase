/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TwoDimTransformations from "./2dTransformations";

export function get2dTransformationsSpec(): SampleSpec {
  return ({
    name: "2d-transformations-sample",
    label: "2d Transformations",
    image: "2d-transformations-thumbnail.png",
    files: [
      { name: "2dTransformations.tsx", import: import("!!raw-loader!./2dTransformations"), entry: true },
    ],
    setup: TwoDimTransformations.setup,
    teardown: TwoDimTransformations.teardown,
  });
}
