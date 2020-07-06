/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomWebfontIconsTreeSample from "./CustomWebfontIconsTree";

export function getCustomWebfontIconsTreeSpec(): SampleSpec {
  return ({
    name: "custom-webfont-icons-tree-sample",
    label: "Custom Webfont Icons Tree",
    image: "custom-webfont-icons-tree-thumbnail.png",
    files: [
      { name: "CustomWebfontIconsTreeSample.tsx", import: import("!!raw-loader!./CustomWebfontIconsTree"), entry: true },
    ],
    setup: CustomWebfontIconsTreeSample.setup,
  });
}
