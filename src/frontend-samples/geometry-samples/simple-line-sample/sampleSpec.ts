/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import SimpleLineUI from "./SimpleLineUI";

export function getSimpleLineSpec(): SampleMetadata {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "SimpleLineApp.tsx", import: import("!!raw-loader!./SimpleLineApp") },
      { name: "SimpleLineUI.tsx", import: import("!!raw-loader!./SimpleLineUI"), entry: true },
    ],
    sampleClass: SimpleLineUI,
  });
}
