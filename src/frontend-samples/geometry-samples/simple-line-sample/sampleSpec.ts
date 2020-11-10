/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SimpleLineApp from "./SimpleLineApp";

export function getSimpleLineSpec(): SampleSpec {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    customModelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "SimpleLineApp.tsx", import: import("!!raw-loader!./SimpleLineApp"), entry: true },
      { name: "SimpleLineUI.tsx", import: import("!!raw-loader!./SimpleLineUI") },
    ],
    setup: SimpleLineApp.setup,
  });
}
