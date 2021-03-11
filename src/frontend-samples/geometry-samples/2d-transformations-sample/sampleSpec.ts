/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import Transformations2dUI from "./2dTransformationsUI";

export function get2dTransformationsSpec(): SampleMetadata {
  return ({
    name: "2d-transformations-sample",
    label: "2d Transformations",
    image: "2d-transformations-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "2dTransformationsApp.tsx", import: import("!!raw-loader!./2dTransformationsApp") },
      { name: "2dTransformationsUI.tsx", import: import("!!raw-loader!./2dTransformationsUI"), entry: true },
    ],
    sampleClass: Transformations2dUI,
  });
}
