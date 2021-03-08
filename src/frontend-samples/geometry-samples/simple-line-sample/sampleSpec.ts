/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getSimpleLineSpec(): SampleSpec {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "SimpleLineUI.tsx", import: import("!!raw-loader!./SimpleLineUI"), entry: true },
      { name: "SimpleLineApp.tsx", import: import("!!raw-loader!./SimpleLineApp") },
    ],
    type: "SimpleLineUI",
  });
}
