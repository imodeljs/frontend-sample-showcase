/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getExpandableListSpec(): SampleSpec {
  return ({
    name: "expandable-list-sample",
    label: "UI-Expandable Lists",
    image: "ui-expandable-list-thumbnail.png",
    description: "#Component #sample showing different #styles of #expandable #lists.",
    iModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ExpandableList?entry=true"),
    ],
    type: "ExpandableList.tsx",
  });
}
