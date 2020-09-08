/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SearchBoxList from "./SearchBox";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSearchBoxSpec(): SampleSpec {
  return ({
    name: "search-box-sample",
    label: "UI-Search Boxes",
    image: "ui-search-boxes-thumbnail.png",
    customModelList: [],
    files: [
      { name: "SearchBox.tsx", import: import("!!raw-loader!./SearchBox"), entry: true },
    ],
    setup: SearchBoxList.setup.bind(SearchBoxList),
  });
}
