/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import InputsList from "./Inputs";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getInputsSpec(): SampleMetadata {
  return ({
    name: "inputs-sample",
    label: "UI-Inputs",
    image: "ui-inputs-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Inputs.tsx", import: import("!!raw-loader!./Inputs"), entry: true },
      { name: "SampleImageCheckBox.tsx", import: import("!!raw-loader!./SampleImageCheckBox") },
    ],
    sampleClass: InputsList,
  });
}
