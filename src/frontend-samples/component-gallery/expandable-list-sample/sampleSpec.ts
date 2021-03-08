/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import ExpandableListList from "./ExpandableList";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getExpandableListSpec(): SampleSpec {
  return ({
    name: "expandable-list-sample",
    label: "UI-Expandable Lists",
    image: "ui-expandable-list-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "ExpandableList.tsx", import: import("!!raw-loader!./ExpandableList"), entry: true },
      { name: "SampleExpandableBlock.tsx", import: import("!!raw-loader!./SampleExpandableBlock") },
    ],
    sampleClass: ExpandableListList,
    type: "ExpandableListList",
  });
}
