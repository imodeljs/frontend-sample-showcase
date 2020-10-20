/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Advanced3dApp from "./Advanced3dApp";

export function getAdvanced3dSpec(): SampleSpec {
  return ({
    name: "advanced-3d-sample",
    label: "Advanced 3d",
    image: "advanced-3d-thumbnail.png",
    files: [
      { name: "Advanced3dApp.tsx", import: import("!!raw-loader!./Advanced3dApp"), entry: true },
      { name: "Advanced3dUI.tsx", import: import("!!raw-loader!./Advanced3dUI") },

    ],
    setup: Advanced3dApp.setup,
    teardown: Advanced3dApp.teardown,
  });
}
