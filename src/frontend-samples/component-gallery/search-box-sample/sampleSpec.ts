/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSearchBoxSpec(): SampleSpec {
  return ({
    name: "search-box-sample",
    label: "UI-Search Boxes",
    image: "ui-search-boxes-thumbnail.png",
    description: "#Component #sample showing different #styles of #search #boxes.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./SearchBox?entry=true"),
    ],
    type: "SearchBox.tsx",
  });
}
