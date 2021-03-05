/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewportOnlyUI from "./ViewportOnlyUI";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "3d",
    image: "viewport-only-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewportOnlyUI.tsx", import: import("!!raw-loader!./ViewportOnlyUI"), entry: true },
    ],
    sampleClass: ViewportOnlyUI,
  });
}
