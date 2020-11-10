/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Transformations2dApp from "./2dTransformationsApp";

export function get2dTransformationsSpec(): SampleSpec {
  return ({
    name: "2d-transformations-sample",
    label: "2d Transformations",
    image: "2d-transformations-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "2dTransformationsApp.tsx", import: import("!!raw-loader!./2dTransformationsApp"), entry: true },
      { name: "2dTransformationsUI.tsx", import: import("!!raw-loader!./2dTransformationsUI") },

    ],
    setup: Transformations2dApp.setup.bind(Transformations2dApp),
  });
}
