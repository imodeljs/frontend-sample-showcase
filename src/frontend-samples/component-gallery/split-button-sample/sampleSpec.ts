/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSplitButtonSpec(): SampleSpec {
  return ({
    name: "split-button-sample",
    label: "UI-Split Buttons",
    image: "ui-split-button-thumbnail.png",
    customModelList: [],
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "SplitButton.tsx", import: import("!!raw-loader!./SplitButton"), entry: true },
    ],
    type: "SplitButton.tsx",
  });
}
