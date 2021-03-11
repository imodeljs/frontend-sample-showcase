/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import CheckListBoxList from "./CheckListBox";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getCheckListBoxSpec(): SampleMetadata {
  return ({
    name: "checklistbox-sample",
    label: "UI-CheckListBoxes",
    image: "ui-checklistbox-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    modelList: [],
    files: [
      { name: "CheckListBox.tsx", import: import("!!raw-loader!./CheckListBox"), entry: true },
    ],
    sampleClass: CheckListBoxList,
  });
}
