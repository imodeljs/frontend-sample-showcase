/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getCheckListBoxSpec(): SampleSpec {
  return ({
    name: "checklistbox-sample",
    label: "UI-CheckListBoxes",
    image: "ui-checklistbox-thumbnail.png",
    description: "#Component #sample showing different #styles of #checklistboxes.",
    readme: async () => import("!!raw-loader!./readme.md"),
    iModelList: [],
    files: () => [
      import("!editor-file-loader!./CheckListBox?entry=true"),
    ],
    type: "CheckListBox.tsx",
  });
}
