/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Simple3d from "./Simple3d";

export function getSimple3dSpec(): SampleSpec {
  return ({
    name: "simple-3d-sample",
    label: "Simple 3d",
    image: "simple-3d-thumbnail.png",
    files: [
      { name: "Simple3d.tsx", import: import("!!raw-loader!./Simple3d"), entry: true },
    ],
    setup: Simple3d.setup,
    teardown: Simple3d.teardown,
  });
}
