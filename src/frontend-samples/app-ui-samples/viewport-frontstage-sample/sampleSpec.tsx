
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ViewportFrontstageSample } from "./index";

export function getViewportFrontstageSample(): SampleSpec {
  return ({
    name: "viewport-frontstage-sample",
    label: "Viewport Frontstage",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ViewportFrontstageSample.tsx", import: import("!!raw-loader!./index") },
      { name: "ViewportFrontstage.tsx", import: import("!!raw-loader!../../../Components/frontstages/ViewportFrontstage")},
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
    ],
    setup: ViewportFrontstageSample.setup,
    teardown: ViewportFrontstageSample.teardown,
  });
}
