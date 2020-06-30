/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TabsList from ".";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTabsSpec(): SampleSpec {
  return ({
    name: "tabs-sample",
    label: "UI-Tabs",
    image: "ui-tabs-thumbnail.png",
    customModelList: [],
    files: [
      { name: "TabsListSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: TabsList.setup,
  });
}
