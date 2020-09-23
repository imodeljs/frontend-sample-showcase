/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import Animated3d from "./Animated3d";

export function getAnimated3dSpec(): SampleSpec {
  return ({
    name: "animated-3d-sample",
    label: "Animated 3d",
    image: "heatmap-decorator-thumbnail.png",
    files: [
      { name: "Animated3d.tsx", import: import("!!raw-loader!./Animated3d"), entry: true },
    ],
    setup: Animated3d.setup,
    teardown: Animated3d.teardown,
  });
}
