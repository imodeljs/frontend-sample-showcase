/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewportOnlyApp from "./ViewportOnlyApp";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "3d",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ViewportOnlyApp.tsx", import: import("!!raw-loader!./ViewportOnlyApp"), entry: true },
      { name: "ViewportOnlyUI.tsx", import: import("!!raw-loader!./ViewportOnlyUI") },
    ],
    setup: ViewportOnlyApp.setup.bind(ViewportOnlyApp),
  });
}
