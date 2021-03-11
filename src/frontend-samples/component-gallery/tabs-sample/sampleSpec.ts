/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import TabsList from "./Tabs";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTabsSpec(): SampleMetadata {
  return ({
    name: "tabs-sample",
    label: "UI-Tabs",
    image: "ui-tabs-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Tabs.tsx", import: import("!!raw-loader!./Tabs"), entry: true },
    ],
    sampleClass: TabsList,
  });
}
