/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import ButtonList from "./Button";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getButtonSpec(): SampleMetadata {
  return ({
    name: "button-sample",
    label: "UI-Buttons",
    image: "ui-button-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    modelList: [],
    files: [
      { name: "Button.tsx", import: import("!!raw-loader!./Button"), entry: true },
    ],
    sampleClass: ButtonList,
  });
}
