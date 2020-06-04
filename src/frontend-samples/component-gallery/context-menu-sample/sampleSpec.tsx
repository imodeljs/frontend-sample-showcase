/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { ContextMenuList } from ".";

export function getContextMenuSpec(): SampleSpec {
  return ({
    name: "context-menu-sample",
    label: "ContextMenu",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ContextMenuListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "SampleContextMenu.tsx", import: import("!!raw-loader!./SampleContextMenu") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: ContextMenuList.setup,
  });
}