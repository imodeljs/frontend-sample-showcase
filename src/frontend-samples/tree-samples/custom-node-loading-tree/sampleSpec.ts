/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { CustomNodeLoadingTreeUI } from "./CustomNodeLoadingTreeUI";

export function getCustomNodeLoadingTreeSpec(): SampleSpec {
  return ({
    name: "custom-node-loading-sample",
    label: "Custom Node Loading Tree",
    image: "custom-node-loading-tree-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "CustomNodeLoadingTreeUI.tsx", import: import("!!raw-loader!./CustomNodeLoadingTreeUI"), entry: true },
      { name: "CustomNodeLoadingTreeApp.tsx", import: import("!!raw-loader!./CustomNodeLoadingTreeApp") },
    ],
    sampleClass: CustomNodeLoadingTreeUI,
  });
}
