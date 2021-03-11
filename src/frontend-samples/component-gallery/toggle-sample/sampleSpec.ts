/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import ToggleList from "./Toggle";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getToggleSpec(): SampleMetadata {
  return ({
    name: "toggle-sample",
    label: "UI-Toggles",
    image: "ui-toggle-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Toggle.tsx", import: import("!!raw-loader!./Toggle"), entry: true },
    ],
    sampleClass: ToggleList,
  });
}
