/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ExpandableListList from ".";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getExpandableListSpec(): SampleSpec {
  return ({
    name: "expandable-list-sample",
    label: "UI-Expandable Lists",
    image: "ui-expandable-list-thumbnail.png",
    customModelList: [],
    files: [
      { name: "ExpandableListListSample.tsx", import: import("!!raw-loader!./index"), entry: true },
      { name: "SampleExpandableBlock.tsx", import: import("!!raw-loader!./SampleExpandableBlock") },
    ],
    setup: ExpandableListList.setup,
  });
}
