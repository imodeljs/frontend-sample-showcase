/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TabsList from "./Tabs";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTabsSpec(): SampleSpec {
  return ({
    name: "tabs-sample",
    label: "UI-Tabs",
    image: "ui-tabs-thumbnail.png",
    customModelList: [],
    files: [
      { name: "Tabs.tsx", import: import("!!raw-loader!./Tabs") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: TabsList.setup,
  });
}
