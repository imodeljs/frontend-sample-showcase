/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Advanced3d from "./Advanced3d";

export function getAdvanced3dSpec(): SampleSpec {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    files: [
      { name: "Advanced3d.tsx", import: import("!!raw-loader!./Advanced3d"), entry: true },
    ],
    setup: Advanced3d.setup,
    teardown: Advanced3d.teardown,
  });
}
