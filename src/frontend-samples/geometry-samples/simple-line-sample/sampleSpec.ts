/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SimpleLine from "./SimpleLine";

export function getSimpleLineSpec(): SampleSpec {
  return ({
    name: "simple-line-sample",
    label: "Simple Line",
    image: "simple-line-thumbnail.png",
    files: [
      { name: "SimpleLine.tsx", import: import("!!raw-loader!./SimpleLine"), entry: true },
    ],
    setup: SimpleLine.setup,
    teardown: SimpleLine.teardown,
  });
}
