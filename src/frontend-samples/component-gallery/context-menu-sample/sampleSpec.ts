/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ContextMenuList from "./ContextMenu";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getContextMenuSpec(): SampleSpec {
  return ({
    name: "context-menu-sample",
    label: "UI-Context Menus",
    image: "ui-context-menu-thumbnail.png",
    customModelList: [],
    files: [
      { name: "ContextMenu.tsx", import: import("!!raw-loader!./ContextMenu"), entry: true },
      { name: "SampleContextMenu.tsx", import: import("!!raw-loader!./SampleContextMenu") },
    ],
    setup: ContextMenuList.setup,
  });
}
