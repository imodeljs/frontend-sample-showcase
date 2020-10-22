/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ExpandableListList from "./ExpandableList";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getExpandableListSpec(): SampleSpec {
  return ({
    name: "expandable-list-sample",
    label: "UI-Expandable Lists",
    image: "ui-expandable-list-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ExpandableList.tsx", import: import("!!raw-loader!./ExpandableList"), entry: true },
      { name: "SampleExpandableBlock.tsx", import: import("!!raw-loader!./SampleExpandableBlock") },
    ],
    setup: ExpandableListList.setup.bind(ExpandableListList),
  });
}
